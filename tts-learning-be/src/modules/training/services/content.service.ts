import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../../common/services/base.service';
import { Quiz } from '../entities/quiz.entity';
import { QuizQuestion } from '../entities/quiz-question.entity';
import { ModuleContent } from '../entities/module-content.entity';
import { QuizAttempt } from '../entities/quiz-attempt.entity';
import { InternProgress } from '../entities/intern-progress.entity';
import { SubmitQuizDto, CreateQuizDto } from '../dto/content.dto';

@Injectable()
export class QuizService extends BaseService<Quiz> {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @InjectRepository(QuizQuestion)
    private readonly questionRepository: Repository<QuizQuestion>,
    @InjectRepository(QuizAttempt)
    private readonly attemptRepository: Repository<QuizAttempt>,
    @InjectRepository(InternProgress)
    private readonly progressRepository: Repository<InternProgress>,
  ) {
    super(quizRepository);
  }

  async createWithQuestions(data: CreateQuizDto): Promise<Quiz> {
    const { questions, ...quizData } = data;
    const quiz = await this.create(quizData);

    if (questions && questions.length > 0) {
      const questionEntities = questions.map((q) => this.questionRepository.create({ ...q, quiz }));
      await this.questionRepository.save(questionEntities);
    }

    return this.findOne(quiz.id, { relations: ['questions'] });
  }

  async submitQuiz(internId: string, dto: SubmitQuizDto): Promise<QuizAttempt> {
    const quiz = await this.findOne(dto.quizId, { relations: ['questions'] });
    const { questions } = quiz;

    let score = 0;
    const totalPoints = questions.reduce((acc, q) => acc + q.points, 0);

    // Tính điểm nè
    questions.forEach((question) => {
      const internAnswer = dto.answers[question.id];
      if (internAnswer === question.correctAnswer) {
        score += question.points;
      }
    });

    const status = score >= quiz.passingScore ? 'passed' : 'failed';

    // Tạo bản ghi Attempt
    const attempt = this.attemptRepository.create({
      quizId: quiz.id,
      internId: internId,
      submittedAt: new Date(),
      score: score,
      totalPoints: totalPoints,
      status: status,
      answers: dto.answers,
    });

    const savedAttempt = await this.attemptRepository.save(attempt);

    // Nếu Pass, cập nhật tiến độ cho Intern nà
    if (status === 'passed') {
      await this.updateInternProgress(internId, quiz.moduleId);
    }

    return savedAttempt;
  }

  private async updateInternProgress(internId: string, moduleId: string) {
    const progress = await this.progressRepository.findOne({ where: { internId } });
    if (progress) {
      const completedModules = progress.modulesCompleted || [];
      if (!completedModules.includes(moduleId)) {
        completedModules.push(moduleId);
        progress.modulesCompleted = completedModules;
        // Logic tính % tiến độ đơn giản: (số module xong / tổng số module) * 100
        // Tạm thời cứ push vào đã nhé!
        await this.progressRepository.save(progress);
      }
    }
  }
}

@Injectable()
export class ModuleContentService extends BaseService<ModuleContent> {
  constructor(
    @InjectRepository(ModuleContent)
    private readonly contentRepository: Repository<ModuleContent>,
  ) {
    super(contentRepository);
  }

  async getNextOrderIndex(moduleId: string): Promise<number> {
    const latest = await this.contentRepository.findOne({
      where: { moduleId },
      order: { orderIndex: 'DESC', createdAt: 'DESC' },
    });

    return (latest?.orderIndex || 0) + 1;
  }
}
