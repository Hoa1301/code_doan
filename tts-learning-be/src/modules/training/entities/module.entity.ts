import { Entity, Column, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { LearningPath } from './learning-path.entity';
import { ModuleContent } from './module-content.entity';
import { Quiz } from './quiz.entity';
import { ModuleFinalTest } from './module-final-test.entity';

@Entity('modules')
export class Module extends BaseEntity {
  @ManyToOne(() => LearningPath, (path) => path.modules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'learning_path_id' })
  learningPath: LearningPath;

  @Column({ name: 'learning_path_id' })
  learningPathId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'order_index' })
  orderIndex: number;

  @Column({ default: 'ready' })
  status: string; // ready, in_progress, locked

  @Column({ name: 'passing_score', default: 80 })
  passingScore: number;

  @Column({ name: 'is_required', default: true })
  isRequired: boolean;

  @OneToMany(() => ModuleContent, (content) => content.module)
  contents: ModuleContent[];

  @OneToMany(() => Quiz, (quiz) => quiz.module)
  quizzes: Quiz[];

  @OneToOne(() => ModuleFinalTest, (finalTest) => finalTest.module)
  finalTest: ModuleFinalTest | null;
}
