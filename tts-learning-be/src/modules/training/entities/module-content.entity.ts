import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Module } from './module.entity';

@Entity('module_contents')
export class ModuleContent extends BaseEntity {
  @ManyToOne(() => Module, (module) => module.contents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module: Module;

  @Column({ name: 'module_id' })
  moduleId: string;

  @Column()
  type: string; // video, document, quiz

  @Column()
  title: string;

  @Column({ name: 'content_url', nullable: true })
  contentUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any; // {duration: "10 min", size: "5 MB", etc.}

  @Column({ name: 'order_index' })
  orderIndex: number;
}
