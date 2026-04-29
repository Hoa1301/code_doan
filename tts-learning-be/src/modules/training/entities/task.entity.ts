import { Entity, Column, ManyToOne, JoinColumn, OneToMany, BeforeInsert } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../auth/entities/user.entity';
import { TaskStatus } from '../../../common/constants/status.enum';
import { Intern } from './intern.entity';
import { TaskComment } from './task-comment.entity';

@Entity('tasks')
export class Task extends BaseEntity {
  @Column({ unique: true })
  code: string; // TSK-201

  @BeforeInsert()
  ensureCode() {
    if (!this.code) {
      this.code = `TSK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
  }

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Intern, (intern) => intern.tasks)
  @JoinColumn({ name: 'intern_id' })
  intern: Intern;

  @Column({ name: 'intern_id' })
  internId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'mentor_id' })
  mentor: User;

  @Column({ name: 'mentor_id' })
  mentorId: string;

  @Column({ default: 'medium' })
  priority: string; // low, medium, high

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TO_DO,
  })
  status: TaskStatus;

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  @Column({ name: 'revision_request', type: 'text', nullable: true })
  revisionRequest: string;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @OneToMany(() => TaskComment, (comment) => comment.task)
  comments: TaskComment[];
}
