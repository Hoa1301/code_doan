import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { StorageService } from '@/common/storage/storage.service';
import { Evaluation } from '../entities/evaluation.entity';
import { Phase1ModuleEvaluation } from '../entities/phase1-module-evaluation.entity';
import { UpsertPhase1ModuleEvaluationDto } from '../dto/phase1-module-evaluation.dto';
import { Intern } from '@/modules/training/entities/intern.entity';
import { InternProgress } from '@/modules/training/entities/intern-progress.entity';
import { LearningPath } from '@/modules/training/entities/learning-path.entity';
import { Module as TrainingModule } from '@/modules/training/entities/module.entity';
import { ModuleFinalTest } from '@/modules/training/entities/module-final-test.entity';
import { ModuleFinalTestSubmission } from '@/modules/training/entities/module-final-test-submission.entity';

type FileResource = {
  fileName: string;
  originalName: string | null;
  url: string | null;
};

type Phase1Context = {
  learningPath: LearningPath | null;
  modules: TrainingModule[];
};

@Injectable()
export class Phase1EvaluationService {
  constructor(
    @InjectRepository(Evaluation)
    private readonly evaluationRepository: Repository<Evaluation>,
    @InjectRepository(Phase1ModuleEvaluation)
    private readonly phase1ModuleEvaluationRepository: Repository<Phase1ModuleEvaluation>,
    @InjectRepository(Intern)
    private readonly internRepository: Repository<Intern>,
    @InjectRepository(InternProgress)
    private readonly progressRepository: Repository<InternProgress>,
    @InjectRepository(LearningPath)
    private readonly learningPathRepository: Repository<LearningPath>,
    @InjectRepository(TrainingModule)
    private readonly moduleRepository: Repository<TrainingModule>,
    @InjectRepository(ModuleFinalTest)
    private readonly finalTestRepository: Repository<ModuleFinalTest>,
    @InjectRepository(ModuleFinalTestSubmission)
    private readonly submissionRepository: Repository<ModuleFinalTestSubmission>,
    private readonly storageService: StorageService,
  ) {}

  async getPhase1Detail(internId: string) {
    await this.ensureInternExists(internId);

    const context = await this.resolvePhase1Context(internId);
    const moduleIds = context.modules.map((module) => module.id);
    const [moduleEvaluations, submissions, summaryEvaluation] = await Promise.all([
      moduleIds.length
        ? this.phase1ModuleEvaluationRepository.find({
            where: { internId, moduleId: In(moduleIds) },
            relations: ['mentor', 'submission', 'finalTest'],
          })
        : Promise.resolve([]),
      moduleIds.length
        ? this.submissionRepository.find({
            where: { internId, moduleId: In(moduleIds) },
          })
        : Promise.resolve([]),
      this.evaluationRepository.findOne({
        where: {
          internId,
          type: In(['Probation', 'phase1']),
        },
        relations: ['mentor'],
        order: { updatedAt: 'DESC' },
      }),
    ]);

    const evaluationMap = new Map(moduleEvaluations.map((item) => [item.moduleId, item]));
    const submissionMap = new Map(submissions.map((item) => [item.moduleId, item]));
    const completedScores = context.modules
      .map((module) => evaluationMap.get(module.id))
      .filter((item): item is Phase1ModuleEvaluation => Boolean(item?.status === 'completed' && item.score !== null));
    const isAverageReady = context.modules.length > 0 && completedScores.length === context.modules.length;
    const averageScore = isAverageReady
      ? this.roundScore(completedScores.reduce((sum, item) => sum + Number(item.score || 0), 0) / completedScores.length)
      : null;

    const moduleDetails = await Promise.all(
      context.modules.map(async (module) => {
        const finalTest = module.finalTest || null;
        const submission = submissionMap.get(module.id) || null;
        const evaluation = evaluationMap.get(module.id) || null;

        return {
          moduleId: module.id,
          moduleTitle: module.title,
          moduleDescription: module.description,
          orderIndex: module.orderIndex,
          finalTest: await this.toFinalTestResponse(finalTest),
          submission: await this.toSubmissionResponse(submission),
          evaluation: this.toModuleEvaluationResponse(evaluation),
        };
      }),
    );

    return {
      internId,
      phaseType: 'Probation',
      learningPath: context.learningPath
        ? {
            id: context.learningPath.id,
            title: context.learningPath.title,
            track: context.learningPath.track,
          }
        : null,
      totalModules: context.modules.length,
      gradedModules: completedScores.length,
      isAverageReady,
      averageScore,
      summaryEvaluation: summaryEvaluation
        ? {
            id: summaryEvaluation.id,
            type: 'Probation',
            status: summaryEvaluation.status,
            overallScore: summaryEvaluation.overallScore,
            evaluationDate: summaryEvaluation.evaluationDate,
            mentor: summaryEvaluation.mentor
              ? {
                  id: summaryEvaluation.mentor.id,
                  fullName: summaryEvaluation.mentor.fullName,
                }
              : null,
          }
        : null,
      modules: moduleDetails,
    };
  }

  async upsertModuleEvaluation(
    internId: string,
    moduleId: string,
    mentorId: string,
    dto: UpsertPhase1ModuleEvaluationDto,
  ) {
    const context = await this.resolvePhase1Context(internId);
    const targetModule = context.modules.find((module) => module.id === moduleId);

    if (!targetModule) {
      throw new NotFoundException('Học phần này không thuộc lộ trình của thực tập sinh');
    }

    const submission = await this.resolveSubmission(internId, moduleId, dto.submissionId);

    if ((dto.status || 'draft') === 'completed' && (dto.score === undefined || dto.score === null)) {
      throw new BadRequestException('Cần nhập điểm trước khi hoàn tất đánh giá học phần');
    }

    if ((dto.status || 'draft') === 'completed' && !submission) {
      throw new BadRequestException('Thực tập sinh chưa nộp bài cho học phần này');
    }

    const finalTest = await this.finalTestRepository.findOne({
      where: { moduleId },
    });

    const record =
      (await this.phase1ModuleEvaluationRepository.findOne({
        where: { internId, moduleId },
      })) ||
      this.phase1ModuleEvaluationRepository.create({
        internId,
        moduleId,
      });

    Object.assign(record, {
      mentorId,
      finalTestId: finalTest?.id || null,
      submissionId: submission?.id || null,
      score: dto.score ?? record.score ?? null,
      feedback: dto.feedback !== undefined ? this.normalizeText(dto.feedback) : record.feedback ?? null,
      status: dto.status || record.status || 'draft',
      evaluatedAt: new Date(),
    });

    await this.phase1ModuleEvaluationRepository.save(record);

    if (submission && record.status === 'completed' && submission.status !== 'graded') {
      submission.status = 'graded';
      await this.submissionRepository.save(submission);
    }

    await this.syncPhase1SummaryEvaluation(internId, mentorId, context.modules);
    return this.getPhase1Detail(internId);
  }

  private async resolvePhase1Context(internId: string): Promise<Phase1Context> {
    const latestProgress = await this.progressRepository.findOne({
      where: { internId },
      relations: ['learningPath'],
      order: { updatedAt: 'DESC' },
    });

    if (latestProgress?.learningPathId) {
      const modules = await this.moduleRepository.find({
        where: { learningPathId: latestProgress.learningPathId },
        relations: ['finalTest'],
        order: { orderIndex: 'ASC', createdAt: 'ASC' },
      });

      return {
        learningPath: latestProgress.learningPath,
        modules,
      };
    }

    const intern = await this.internRepository.findOne({
      where: { id: internId },
    });

    if (!intern?.track) {
      return {
        learningPath: null,
        modules: [],
      };
    }

    const learningPath = await this.learningPathRepository.findOne({
      where: { track: intern.track },
    });

    if (!learningPath) {
      return {
        learningPath: null,
        modules: [],
      };
    }

    const modules = await this.moduleRepository.find({
      where: { learningPathId: learningPath.id },
      relations: ['finalTest'],
      order: { orderIndex: 'ASC', createdAt: 'ASC' },
    });

    return {
      learningPath,
      modules,
    };
  }

  private async resolveSubmission(internId: string, moduleId: string, submissionId?: string) {
    if (submissionId) {
      const submission = await this.submissionRepository.findOne({
        where: { id: submissionId, internId, moduleId },
      });

      if (!submission) {
        throw new NotFoundException('Không tìm thấy bài nộp phù hợp với học phần này');
      }

      return submission;
    }

    return this.submissionRepository.findOne({
      where: { internId, moduleId },
    });
  }

  private async syncPhase1SummaryEvaluation(internId: string, mentorId: string, modules: TrainingModule[]) {
    const moduleIds = modules.map((module) => module.id);
    const moduleEvaluations = moduleIds.length
      ? await this.phase1ModuleEvaluationRepository.find({
          where: { internId, moduleId: In(moduleIds) },
        })
      : [];
    const completedEvaluations = modules
      .map((module) => moduleEvaluations.find((item) => item.moduleId === module.id))
      .filter((item): item is Phase1ModuleEvaluation => Boolean(item?.status === 'completed' && item.score !== null));
    const isCompleted = modules.length > 0 && completedEvaluations.length === modules.length;
    const averageScore = isCompleted
      ? this.roundScore(completedEvaluations.reduce((sum, item) => sum + Number(item.score || 0), 0) / completedEvaluations.length)
      : null;
    const existingSummary =
      (await this.evaluationRepository.findOne({
        where: {
          internId,
          type: In(['Probation', 'phase1']),
        },
        order: { updatedAt: 'DESC' },
      })) || this.evaluationRepository.create({ internId });

    if (!moduleEvaluations.length && !existingSummary.id) {
      return null;
    }

    existingSummary.type = 'Probation';
    existingSummary.mentorId = mentorId || existingSummary.mentorId;
    existingSummary.evaluationDate = new Date();
    existingSummary.overallScore = averageScore;
    existingSummary.status = isCompleted ? 'completed' : moduleEvaluations.length ? 'draft' : existingSummary.status || 'draft';

    return this.evaluationRepository.save(existingSummary);
  }

  private async ensureInternExists(internId: string): Promise<void> {
    const internExists = await this.internRepository.exists({
      where: { id: internId },
    });

    if (!internExists) {
      throw new NotFoundException('Không tìm thấy thực tập sinh');
    }
  }

  private normalizeText(value?: string): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }

  private roundScore(score: number): number {
    return Math.round(score * 10) / 10;
  }

  private async buildFileResource(fileName?: string | null, originalName?: string | null): Promise<FileResource | null> {
    if (!fileName) {
      return null;
    }

    let url: string | null = null;

    try {
      url = await this.storageService.getFileUrl(fileName);
    } catch {
      url = null;
    }

    return {
      fileName,
      originalName: originalName || null,
      url,
    };
  }

  private async toFinalTestResponse(record: ModuleFinalTest | null) {
    if (!record) {
      return null;
    }

    return {
      id: record.id,
      moduleId: record.moduleId,
      description: record.description,
      materialLink: record.materialLink,
      materialFile: await this.buildFileResource(record.materialFileName, record.materialOriginalName),
    };
  }

  private async toSubmissionResponse(record: ModuleFinalTestSubmission | null) {
    if (!record) {
      return null;
    }

    return {
      id: record.id,
      moduleId: record.moduleId,
      internId: record.internId,
      description: record.description,
      submissionLink: record.submissionLink,
      status: record.status,
      submittedAt: record.submittedAt,
      submissionFile: await this.buildFileResource(record.submissionFileName, record.submissionOriginalName),
    };
  }

  private toModuleEvaluationResponse(record: Phase1ModuleEvaluation | null) {
    if (!record) {
      return null;
    }

    return {
      id: record.id,
      score: record.score,
      feedback: record.feedback,
      status: record.status,
      evaluatedAt: record.evaluatedAt,
      mentor: record.mentor
        ? {
            id: record.mentor.id,
            fullName: record.mentor.fullName,
          }
        : null,
    };
  }
}
