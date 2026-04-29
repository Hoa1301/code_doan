import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../auth/entities/user.entity';
import { JobPositionStatus } from '../../../common/constants/status.enum';
import { RecruitmentPlan } from './recruitment-plan.entity';
import { Candidate } from './candidate.entity';

@Entity('job_positions')
export class JobPosition extends BaseEntity {
  @Column({ unique: true })
  code: string; // JOB-001

  @Column()
  title: string;

  @ManyToOne(() => RecruitmentPlan, (plan) => plan.jobPositions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recruitment_plan_id' })
  recruitmentPlan: RecruitmentPlan;

  @Column({ name: 'recruitment_plan_id' })
  recruitmentPlanId: string;

  @Column()
  department: string;

  @Column({ name: 'required_quantity' })
  requiredQuantity: number;

  @Column({ name: 'filled_quantity', default: 0 })
  filledQuantity: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  requirements: string;

  @Column({ type: 'text', nullable: true })
  benefits: string;

  @Column({ nullable: true })
  location: string;

  @Column({ name: 'salary_range', nullable: true })
  salaryRange: string;

  @Column({ name: 'posted_date', type: 'date', nullable: true })
  postedDate: Date;

  @Column({ type: 'date', nullable: true })
  deadline: Date;

  @Column({
    type: 'enum',
    enum: JobPositionStatus,
    default: JobPositionStatus.JOB_DRAFT,
  })
  status: JobPositionStatus;

  @OneToMany(() => Candidate, (candidate) => candidate.job)
  candidates: Candidate[];
}
