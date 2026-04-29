import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { User } from '@/modules/auth/entities/user.entity';
import { Intern } from '@/modules/training/entities/intern.entity';
import { Module } from '@/modules/training/entities/module.entity';
import { ModuleFinalTest } from '@/modules/training/entities/module-final-test.entity';
import { ModuleFinalTestSubmission } from '@/modules/training/entities/module-final-test-submission.entity';

@Entity('phase1_module_evaluations')
@Unique(['internId', 'moduleId'])
export class Phase1ModuleEvaluation extends BaseEntity {
  @ManyToOne(() => Intern, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'intern_id' })
  intern: Intern;

  @Column({ name: 'intern_id', type: 'uuid' })
  internId: string;

  @ManyToOne(() => Module, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module: Module;

  @Column({ name: 'module_id', type: 'uuid' })
  moduleId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'mentor_id' })
  mentor: User | null;

  @Column({ name: 'mentor_id', type: 'uuid', nullable: true })
  mentorId: string | null;

  @ManyToOne(() => ModuleFinalTest, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'final_test_id' })
  finalTest: ModuleFinalTest | null;

  @Column({ name: 'final_test_id', type: 'uuid', nullable: true })
  finalTestId: string | null;

  @ManyToOne(() => ModuleFinalTestSubmission, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'submission_id' })
  submission: ModuleFinalTestSubmission | null;

  @Column({ name: 'submission_id', type: 'uuid', nullable: true })
  submissionId: string | null;

  @Column({ type: 'float', nullable: true })
  score: number | null;

  @Column({ type: 'text', nullable: true })
  feedback: string | null;

  @Column({ default: 'draft' })
  status: string;

  @Column({ name: 'evaluated_at', type: 'timestamptz', nullable: true })
  evaluatedAt: Date | null;
}
