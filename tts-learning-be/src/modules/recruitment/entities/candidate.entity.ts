import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../auth/entities/user.entity';
import { CandidateStatus } from '../../../common/constants/status.enum';
import { JobPosition } from './job-position.entity';
import { Interview } from './interview.entity';

@Entity('candidates')
export class Candidate extends BaseEntity {
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  location: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ type: 'text', nullable: true })
  education: string;

  @Column({ type: 'text', nullable: true })
  experience: string;

  @Column({ type: 'simple-array', nullable: true })
  skills: string[];

  @Column({ name: 'resume_url', nullable: true })
  resumeUrl: string;

  @Column({ name: 'cover_letter', type: 'text', nullable: true })
  coverLetter: string;

  @ManyToOne(() => JobPosition, (job) => job.candidates)
  @JoinColumn({ name: 'applied_for_job_id' })
  job: JobPosition;

  @Column({ name: 'applied_for_job_id' })
  jobId: string;

  @Column({ name: 'applied_date', type: 'date', default: () => 'CURRENT_DATE' })
  appliedDate: Date;

  @Column({
    type: 'enum',
    enum: CandidateStatus,
    default: CandidateStatus.PENDING_REVIEW,
  })
  status: CandidateStatus;

  @Column({ name: 'match_score', nullable: true })
  matchScore: number;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  @OneToMany(() => Interview, (interview) => interview.candidate)
  interviews: Interview[];
}
