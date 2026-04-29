import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Quiz } from './quiz.entity';
import { Intern } from './intern.entity';

@Entity('quiz_attempts')
export class QuizAttempt extends BaseEntity {
  @ManyToOne(() => Quiz, (quiz) => quiz.attempts)
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;

  @Column({ name: 'quiz_id' })
  quizId: string;

  @ManyToOne(() => Intern)
  @JoinColumn({ name: 'intern_id' })
  intern: Intern;

  @Column({ name: 'intern_id' })
  internId: string;

  @CreateDateColumn({ name: 'started_at' })
  startedAt: Date;

  @Column({ name: 'submitted_at', nullable: true })
  submittedAt: Date;

  @Column({ nullable: true })
  score: number;

  @Column({ name: 'total_points', nullable: true })
  totalPoints: number;

  @Column({ default: 'in_progress' })
  status: string; // in_progress, submitted, passed, failed

  @Column({ type: 'jsonb', nullable: true })
  answers: any; // {question_id: answer, ...}
}
