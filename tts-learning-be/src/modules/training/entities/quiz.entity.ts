import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../auth/entities/user.entity';
import { Module } from './module.entity';
import { LearningPath } from './learning-path.entity';
import { QuizQuestion } from './quiz-question.entity';
import { QuizAttempt } from './quiz-attempt.entity';

@Entity('quizzes')
export class Quiz extends BaseEntity {
  @ManyToOne(() => Module, (module) => module.quizzes, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module: Module;

  @Column({ name: 'module_id', nullable: true })
  moduleId: string;

  @ManyToOne(() => LearningPath, { nullable: true })
  @JoinColumn({ name: 'learning_path_id' })
  learningPath: LearningPath;

  @Column({ name: 'learning_path_id', nullable: true })
  learningPathId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 'module' })
  type: string; // module, final_assessment

  @Column({ name: 'passing_score', default: 80 })
  passingScore: number;

  @Column({ name: 'time_limit_minutes', nullable: true })
  timeLimitMinutes: number;

  @Column({ name: 'total_questions', nullable: true })
  totalQuestions: number;

  @OneToMany(() => QuizQuestion, (question) => question.quiz)
  questions: QuizQuestion[];

  @OneToMany(() => QuizAttempt, (attempt) => attempt.quiz)
  attempts: QuizAttempt[];
}
