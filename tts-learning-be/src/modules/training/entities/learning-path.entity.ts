import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { User } from '@/modules/auth/entities/user.entity';
import { Module } from './module.entity';

@Entity('learning_paths')
export class LearningPath extends BaseEntity {
  @Column({ unique: true })
  track: string; // Frontend Development, etc.

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => Module, (module) => module.learningPath)
  modules: Module[];
}
