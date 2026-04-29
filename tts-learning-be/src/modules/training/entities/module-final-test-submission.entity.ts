import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { Intern } from './intern.entity';
import { Module } from './module.entity';
import { ModuleFinalTest } from './module-final-test.entity';

@Entity('module_final_test_submissions')
@Unique(['internId', 'moduleId'])
export class ModuleFinalTestSubmission extends BaseEntity {
  @ManyToOne(() => ModuleFinalTest, (finalTest) => finalTest.submissions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'final_test_id' })
  finalTest: ModuleFinalTest | null;

  @Column({ name: 'final_test_id', type: 'uuid', nullable: true })
  finalTestId: string | null;

  @ManyToOne(() => Module, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module: Module;

  @Column({ name: 'module_id', type: 'uuid' })
  moduleId: string;

  @ManyToOne(() => Intern, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'intern_id' })
  intern: Intern;

  @Column({ name: 'intern_id', type: 'uuid' })
  internId: string;

  @Column({ name: 'submission_file_name', type: 'varchar', nullable: true })
  submissionFileName: string | null;

  @Column({ name: 'submission_original_name', type: 'varchar', nullable: true })
  submissionOriginalName: string | null;

  @Column({ name: 'submission_link', type: 'text', nullable: true })
  submissionLink: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'submitted_at', type: 'timestamptz', nullable: true })
  submittedAt: Date | null;

  @Column({ default: 'submitted' })
  status: string;
}
