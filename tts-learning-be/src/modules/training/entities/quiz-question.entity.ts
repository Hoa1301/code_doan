import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Quiz } from './quiz.entity';

@Entity('quiz_questions')
export class QuizQuestion extends BaseEntity {
  @ManyToOne(() => Quiz, (quiz) => quiz.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;

  @Column({ name: 'quiz_id' })
  quizId: string;

  @Column({ name: 'question_text', type: 'text' })
  questionText: string;

  @Column({ name: 'question_type', default: 'multiple_choice' })
  questionType: string; // multiple_choice, true_false, short_answer

  @Column({ type: 'jsonb', nullable: true })
  options: any; // [{"key": "A", "value": "Option A"}, ...]

  @Column({ name: 'correct_answer' })
  correctAnswer: string;

  @Column({ default: 1 })
  points: number;

  @Column({ name: 'order_index' })
  orderIndex: number;
}
