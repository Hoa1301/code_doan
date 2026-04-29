import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../auth/entities/user.entity';
import { RecruitmentPlanStatus } from '../../../common/constants/status.enum';
import { JobPosition } from './job-position.entity';

@Entity('recruitment_plans')
export class RecruitmentPlan extends BaseEntity {
  @Column()
  name: string;

  @Column()
  batch: string;

  @Column()
  department: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: RecruitmentPlanStatus,
    default: RecruitmentPlanStatus.PLAN_DRAFT,
  })
  status: RecruitmentPlanStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approver: User;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_at', nullable: true })
  approvedAt: Date;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  @OneToMany(() => JobPosition, (job) => job.recruitmentPlan, { cascade: true })
  jobPositions: JobPosition[];
}
