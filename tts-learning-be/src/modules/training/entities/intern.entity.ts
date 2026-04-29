import { Entity, Column, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { User } from '@/modules/auth/entities/user.entity';
import { InternStage, InternStatus } from '@/common/constants/status.enum';
import { Candidate } from '@/modules/recruitment/entities/candidate.entity';
import { InternProgress } from './intern-progress.entity';
import { Task } from './task.entity';
import { Evaluation } from '@/modules/evaluation/entities/evaluation.entity';
import { Report } from '@/modules/evaluation/entities/report.entity';

@Entity('interns')
export class Intern extends BaseEntity {
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ unique: true })
  code: string; // ITS-001

  @OneToOne(() => Candidate, { nullable: true })
  @JoinColumn({ name: 'candidate_id' })
  candidate: Candidate;

  @Column({ name: 'candidate_id', nullable: true })
  candidateId: string;

  @Column({ type: 'varchar', nullable: true })
  track: string | null; // Frontend, Backend, etc.

  @ManyToOne(() => User)
  @JoinColumn({ name: 'mentor_id' })
  mentor: User;

  @Column({ name: 'mentor_id' })
  mentorId: string;

  @Column()
  department: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: InternStage,
    default: InternStage.STAGE1,
  })
  currentStage: InternStage;

  @Column({ name: 'overall_progress', default: 0 })
  overallProgress: number;

  @Column({
    type: 'enum',
    enum: InternStatus,
    default: InternStatus.ACTIVE,
  })
  status: InternStatus;

  @OneToMany(() => InternProgress, (progress) => progress.intern)
  progress: InternProgress[];

  @OneToMany(() => Task, (task) => task.intern)
  tasks: Task[];

  @OneToMany(() => Evaluation, (evaluation) => evaluation.intern)
  evaluations: Evaluation[];

  @OneToMany(() => Report, (report) => report.intern)
  reports: Report[];
}
