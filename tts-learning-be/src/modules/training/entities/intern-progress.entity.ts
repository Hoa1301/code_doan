import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Intern } from './intern.entity';
import { LearningPath } from './learning-path.entity';
import { Module } from './module.entity';

@Entity('intern_progress')
@Unique(['internId', 'learningPathId'])
export class InternProgress extends BaseEntity {
  @ManyToOne(() => Intern, (intern) => intern.progress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'intern_id' })
  intern: Intern;

  @Column({ name: 'intern_id' })
  internId: string;

  @ManyToOne(() => LearningPath)
  @JoinColumn({ name: 'learning_path_id' })
  learningPath: LearningPath;

  @Column({ name: 'learning_path_id' })
  learningPathId: string;

  @ManyToOne(() => Module, { nullable: true })
  @JoinColumn({ name: 'current_module_id' })
  currentModule: Module;

  @Column({ name: 'current_module_id', nullable: true })
  currentModuleId: string;

  @Column({ name: 'modules_completed', type: 'simple-array', nullable: true })
  modulesCompleted: string[]; // Array of module IDs

  @Column({ name: 'overall_progress', default: 0 })
  overallProgress: number; // 0-100
}
