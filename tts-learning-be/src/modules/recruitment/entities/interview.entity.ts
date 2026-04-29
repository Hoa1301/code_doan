import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../auth/entities/user.entity';
import { InterviewStatus } from '../../../common/constants/status.enum';
import { Candidate } from './candidate.entity';
import { JobPosition } from './job-position.entity';

@Entity('interviews')
export class Interview extends BaseEntity {
  @Column({ name: 'candidate_id' })
  candidateId!: string;

  @ManyToOne(() => Candidate, (c) => c.interviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidate_id' })
  candidate!: Candidate;

  @Column({ type: 'timestamp' })
  start!: Date;

  @Column({ type: 'timestamp' })
  end!: Date;

  @Column({ nullable: true })
  type!: string; // Online / Offline

  @Column({ type: 'text', nullable: true })
  infoMeeting!: string;

  @Column({ type: 'text', nullable: true })
  note!: string;

  @ManyToOne(() => JobPosition)
  @JoinColumn({ name: 'job_id' })
  job!: JobPosition;

  @Column({ name: 'job_id' })
  jobId!: string;

  @Column({ name: 'interview_date', type: 'date' })
  interviewDate!: Date;

  @Column({ name: 'interview_time', type: 'time' })
  interviewTime!: string;

  @Column({ name: 'duration_minutes', default: 45 })
  durationMinutes!: number;

  @Column()
  format!: string; // online, in_person

  @ManyToOne(() => User)
  @JoinColumn({ name: 'interviewer_id' })
  interviewer!: User;

  @Column({ name: 'interviewer_id', nullable: true })
  interviewerId!: string;

  @Column({
    type: 'enum',
    enum: InterviewStatus,
    default: InterviewStatus.SCHEDULED,
  })
  status!: InterviewStatus;

  @Column({ name: 'is_sent', default: false })
  isSent!: boolean;

  @Column({ nullable: true })
  result!: string; // passed, failed

  @Column({ type: 'text', nullable: true })
  notes!: string;

  @Column({ type: 'text', nullable: true })
  feedback!: string;

  @Column({ name: 'action_token', nullable: true })
  actionToken!: string;

  @Column({ name: 'token_used', default: false })
  tokenUsed!: boolean;
}
