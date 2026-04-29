import { Column, Entity, JoinColumn, OneToMany, OneToOne, Unique } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { Module } from './module.entity';
import { ModuleFinalTestSubmission } from './module-final-test-submission.entity';

@Entity('module_final_tests')
@Unique(['moduleId'])
export class ModuleFinalTest extends BaseEntity {
  @OneToOne(() => Module, (module) => module.finalTest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module: Module;

  @Column({ name: 'module_id', type: 'uuid' })
  moduleId: string;

  @Column({ name: 'material_file_name', type: 'varchar', nullable: true })
  materialFileName: string | null;

  @Column({ name: 'material_original_name', type: 'varchar', nullable: true })
  materialOriginalName: string | null;

  @Column({ name: 'material_link', type: 'text', nullable: true })
  materialLink: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany(() => ModuleFinalTestSubmission, (submission) => submission.finalTest)
  submissions: ModuleFinalTestSubmission[];
}
