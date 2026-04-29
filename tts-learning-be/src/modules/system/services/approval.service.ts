import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../../common/services/base.service';
import { Approval } from '../entities/approval.entity';
import { RecruitmentPlan } from '../../recruitment/entities/recruitment-plan.entity';
import { Candidate } from '../../recruitment/entities/candidate.entity';
import { JobPosition } from '../../recruitment/entities/job-position.entity';
import { RecruitmentPlanStatus, CandidateStatus, JobPositionStatus } from '../../../common/constants/status.enum';

export type ApprovalUpdatePayload = {
  status: 'Approved' | 'Rejected' | 'Adjusting';
  notes?: string;
  approverId?: string;
};

type DirectorActionHistoryItem = {
  action: ApprovalUpdatePayload['status'];
  note?: string;
  actedAt: string;
  approverId?: string;
  previousStatus?: Approval['status'];
};

@Injectable()
export class ApprovalService extends BaseService<Approval> {
  constructor(
    @InjectRepository(Approval)
    private readonly approvalRepository: Repository<Approval>,
    @InjectRepository(RecruitmentPlan)
    private readonly planRepository: Repository<RecruitmentPlan>,
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
    @InjectRepository(JobPosition)
    private readonly jobPositionRepository: Repository<JobPosition>,
  ) {
    super(approvalRepository);
  }

  private normalizePositions(raw: Array<Record<string, unknown>> = []) {
    return raw
      .map((item) => {
        const title = typeof item.title === 'string' ? item.title.trim() : '';
        const department = typeof item.department === 'string' ? item.department.trim() : '';
        const rawCount = item.count ?? item.requiredQuantity;
        const countNumber = typeof rawCount === 'number' ? rawCount : Number(rawCount);
        const count = Number.isFinite(countNumber) ? Math.max(0, countNumber) : 0;
        const requirements = typeof item.requirements === 'string' ? item.requirements : undefined;
        return { title, department, count, requirements };
      })
      .filter((item) => item.title && item.count > 0);
  }

  private async getLatestJobCodeIndex(): Promise<number> {
    const raw = await this.jobPositionRepository
      .createQueryBuilder('job')
      .withDeleted()
      .select("COALESCE(MAX(CAST(SUBSTRING(job.code FROM 5) AS INTEGER)), 0)", 'maxCode')
      .where("job.code ~ '^JOB-[0-9]+$'")
      .getRawOne<{ maxCode: string }>();

    return Number(raw?.maxCode ?? 0);
  }

  private async generateJobCodes(amount: number): Promise<string[]> {
    if (amount <= 0) return [];
    const latestIndex = await this.getLatestJobCodeIndex();
    return Array.from({ length: amount }, (_, index) => `JOB-${(latestIndex + index + 1).toString().padStart(3, '0')}`);
  }

  private async ensureJobPositionsForActivePlan(
    planId: string,
    details: Record<string, unknown>,
  ): Promise<void> {
    const plan = await this.planRepository.findOne({ where: { id: planId } });
    if (!plan || plan.status !== RecruitmentPlanStatus.PLAN_ACTIVE) {
      return;
    }

    const existingCount = await this.jobPositionRepository.count({ where: { recruitmentPlanId: plan.id } });
    if (existingCount > 0) {
      return;
    }

    const rawPositions = Array.isArray(details.positions)
      ? (details.positions as Array<Record<string, unknown>>)
      : Array.isArray(details.jobPositions)
        ? (details.jobPositions as Array<Record<string, unknown>>)
        : [];
    const positions = this.normalizePositions(rawPositions);
    if (positions.length === 0) {
      return;
    }

    const codes = await this.generateJobCodes(positions.length);
    const entities = positions.map((item, index) =>
      this.jobPositionRepository.create({
        code: codes[index],
        title: item.title,
        recruitmentPlanId: plan.id,
        department: item.department || plan.department,
        requiredQuantity: item.count,
        description: plan.description,
        requirements: item.requirements,
        status: JobPositionStatus.JOB_DRAFT,
      }),
    );

    await this.jobPositionRepository.save(entities);
  }

  async update(id: string, data: ApprovalUpdatePayload): Promise<Approval> {
    const approval = await this.findOne(id);
    const previousDetails =
      typeof approval.details === 'object' && approval.details !== null
        ? (approval.details as Record<string, unknown>)
        : {};

    const existingHistory = Array.isArray(previousDetails.directorActionHistory)
      ? (previousDetails.directorActionHistory as DirectorActionHistoryItem[])
      : [];

    const newHistoryItem: DirectorActionHistoryItem = {
      action: data.status,
      note: data.notes,
      approverId: data.approverId,
      actedAt: new Date().toISOString(),
      previousStatus: approval.status,
    };

    const updatedApproval = await super.update(id, {
      status: data.status,
      notes: data.notes,
      details: {
        ...previousDetails,
        directorActionHistory: [...existingHistory, newHistoryItem],
      },
    });

    const hasValidEntityId =
      typeof approval.entityId === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(approval.entityId);

    if (!hasValidEntityId) {
      return updatedApproval;
    }

    // Xử lý logic nghiệp vụ khi Giám đốc phê duyệt/từ chối
    if (approval.type === 'Recruitment') {
      if (data.status === 'Approved') {
        await this.planRepository.update(approval.entityId, {
          status: RecruitmentPlanStatus.PLAN_ACTIVE,
          rejectionReason: undefined,
          approvedBy: data.approverId,
          approvedAt: new Date(),
        });

        const approvalDetails =
          typeof approval.details === 'object' && approval.details !== null
            ? (approval.details as Record<string, unknown>)
            : {};
        await this.ensureJobPositionsForActivePlan(approval.entityId, approvalDetails);
      } else if (data.status === 'Rejected') {
        await this.planRepository.update(approval.entityId, {
          status: RecruitmentPlanStatus.PLAN_REJECTED,
          rejectionReason: data.notes,
          approvedBy: undefined,
          approvedAt: undefined,
        });
      } else if (data.status === 'Adjusting') {
        await this.planRepository.update(approval.entityId, {
          status: RecruitmentPlanStatus.PLAN_REQUEST_EDIT,
          rejectionReason: data.notes,
          approvedBy: undefined,
          approvedAt: undefined,
        });
      }
    } else if (approval.type === 'Conversion') {
      const isApproved = data.status === 'Approved';
      const candidateStatus = isApproved ? CandidateStatus.CONVERTED_TO_INTERN : CandidateStatus.SHORTLISTED;
      await this.candidateRepository.update(approval.entityId, {
        status: candidateStatus,
        rejectionReason: !isApproved ? data.notes : undefined,
      });
    }

    return updatedApproval;
  }

  async getStats() {
    const [pending, approved, rejected] = await Promise.all([
      this.approvalRepository.count({ where: { status: 'Pending' } }),
      this.approvalRepository.count({ where: { status: 'Approved' } }),
      this.approvalRepository.count({ where: { status: 'Rejected' } }),
    ]);

    return { pending, approved, rejected };
  }
}
