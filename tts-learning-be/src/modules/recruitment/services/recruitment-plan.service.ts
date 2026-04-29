import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, QueryFailedError, Repository } from 'typeorm';
import { BaseService } from '../../../common/services/base.service';
import { RecruitmentPlan } from '../entities/recruitment-plan.entity';
import { RecruitmentPlanStatus } from '../../../common/constants/status.enum';
import { Approval } from '../../system/entities/approval.entity';
import { JobPosition } from '../entities/job-position.entity';

type RecruitmentPlanExtraPayload = {
  positions?: Array<Record<string, unknown>>;
  jobPositions?: Array<Record<string, unknown>>;
  priority?: 'High' | 'Normal' | 'Low';
  hr?: string;
};

@Injectable()
export class RecruitmentPlanService extends BaseService<RecruitmentPlan> {
  private static readonly JOB_CODE_UNIQUE_CONSTRAINT = 'UQ_63cb5feb8df11985f3a9adafc6f';
  private static readonly MAX_RETRIES = 5;

  constructor(
    @InjectRepository(RecruitmentPlan)
    private readonly recruitmentPlanRepository: Repository<RecruitmentPlan>,
    @InjectRepository(Approval)
    private readonly approvalRepository: Repository<Approval>,
    @InjectRepository(JobPosition)
    private readonly jobPositionRepository: Repository<JobPosition>,
  ) {
    super(recruitmentPlanRepository);
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async getLatestJobCodeIndex(): Promise<number> {
    const raw = await this.jobPositionRepository
      .createQueryBuilder('job')
      .withDeleted()
      .select('COALESCE(MAX(CAST(SUBSTRING(job.code FROM 5) AS INTEGER)), 0)', 'maxCode')
      .where("job.code ~ '^JOB-[0-9]+$'")
      .getRawOne<{ maxCode: string }>();

    return Number(raw?.maxCode ?? 0);
  }

  private isJobCodeUniqueViolation(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const pgError = error as QueryFailedError & {
      code?: string;
      constraint?: string;
      driverError?: { code?: string; constraint?: string };
    };

    const code = pgError.driverError?.code ?? pgError.code;
    const constraint = pgError.driverError?.constraint ?? pgError.constraint;

    return code === '23505' && constraint === RecruitmentPlanService.JOB_CODE_UNIQUE_CONSTRAINT;
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
        const level = typeof item.level === 'string' ? item.level : undefined;

        return { title, department, count, requirements, level };
      })
      .filter((item) => item.title && item.count > 0);
  }

  private async getPlannedPositionsFromLatestApproval(planId: string) {
    const latestApproval = await this.approvalRepository.findOne({
      where: {
        type: 'Recruitment',
        entityId: planId,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    const rawDetails =
      typeof latestApproval?.details === 'object' && latestApproval.details !== null
        ? (latestApproval.details as Record<string, unknown>)
        : {};

    const rawPositions = Array.isArray(rawDetails.positions)
      ? (rawDetails.positions as Array<Record<string, unknown>>)
      : [];
    return this.normalizePositions(rawPositions);
  }

  private async generateJobCodes(amount: number): Promise<string[]> {
    if (amount <= 0) return [];

    const latestJobCodeIndex = await this.getLatestJobCodeIndex();
    const startIndex = latestJobCodeIndex + 1;

    return Array.from({ length: amount }, (_, i) => `JOB-${(startIndex + i).toString().padStart(3, '0')}`);
  }

  private async syncPlanJobPositions(
    plan: RecruitmentPlan,
    payload?: DeepPartial<RecruitmentPlan> & RecruitmentPlanExtraPayload,
  ): Promise<void> {
    if (plan.status !== RecruitmentPlanStatus.PLAN_ACTIVE) {
      return;
    }

    const existingPositions = await this.jobPositionRepository.count({
      where: { recruitmentPlanId: plan.id },
    });
    if (existingPositions > 0) {
      return;
    }

    const rawPositions = payload?.positions || payload?.jobPositions || [];
    let normalizedPositions = this.normalizePositions(rawPositions);
    if (normalizedPositions.length === 0) {
      normalizedPositions = await this.getPlannedPositionsFromLatestApproval(plan.id);
    }
    if (normalizedPositions.length === 0) return;

    for (let attempt = 0; attempt < RecruitmentPlanService.MAX_RETRIES; attempt += 1) {
      const generatedCodes = await this.generateJobCodes(normalizedPositions.length);

      const mappedPositions: DeepPartial<JobPosition>[] = normalizedPositions.map((item, index) => ({
        code: generatedCodes[index],
        title: item.title,
        recruitmentPlanId: plan.id,
        department: item.department || plan.department,
        requiredQuantity: item.count,
        description: plan.description,
        requirements: item.requirements,
      }));

      try {
        await this.jobPositionRepository.save(this.jobPositionRepository.create(mappedPositions));
        return;
      } catch (error) {
        const isLastAttempt = attempt === RecruitmentPlanService.MAX_RETRIES - 1;
        if (!this.isJobCodeUniqueViolation(error) || isLastAttempt) {
          throw error;
        }

        await this.sleep(25 + Math.floor(Math.random() * 25));
      }
    }

    throw new ConflictException('Duplicate job code detected while syncing plan job positions. Please retry.');
  }

  private async upsertRecruitmentApproval(
    plan: RecruitmentPlan,
    payload?: DeepPartial<RecruitmentPlan> & RecruitmentPlanExtraPayload,
  ) {
    const latestApproval = await this.approvalRepository.findOne({
      where: {
        type: 'Recruitment',
        entityId: plan.id,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    const rawPositions = payload?.positions || payload?.jobPositions || [];
    const incomingPositions = this.normalizePositions(rawPositions);
    const existingDetails =
      typeof latestApproval?.details === 'object' && latestApproval.details !== null
        ? (latestApproval.details as Record<string, unknown>)
        : {};
    const preservedRawPositions = Array.isArray(existingDetails.positions)
      ? (existingDetails.positions as Array<Record<string, unknown>>)
      : Array.isArray(existingDetails.jobPositions)
        ? (existingDetails.jobPositions as Array<Record<string, unknown>>)
        : [];
    const positions = incomingPositions.length > 0 ? incomingPositions : this.normalizePositions(preservedRawPositions);
    const totalPositions = positions.reduce((sum, item) => sum + item.count, 0);

    const priority =
      payload?.priority && ['High', 'Normal', 'Low'].includes(payload.priority) ? payload.priority : 'Normal';

    const details = {
      totalPositions,
      expectedStart: plan.startDate,
      positions,
      justification: payload?.description || plan.description || undefined,
    };

    const approvalData: DeepPartial<Approval> = {
      type: 'Recruitment',
      entityId: plan.id,
      name: plan.name,
      title: plan.batch || plan.name,
      department: plan.department,
      hr: payload?.hr,
      priority,
      status: 'Pending',
      notes: undefined,
      details,
    };

    if (latestApproval && latestApproval.status !== 'Approved') {
      const directorActionHistory = Array.isArray(existingDetails.directorActionHistory)
        ? existingDetails.directorActionHistory
        : [];

      Object.assign(latestApproval, approvalData);
      latestApproval.details = {
        ...(approvalData.details as Record<string, unknown>),
        directorActionHistory,
      };
      await this.approvalRepository.save(latestApproval);
      return;
    }

    const approval = this.approvalRepository.create(approvalData);
    await this.approvalRepository.save(approval);
  }

  async create(data: DeepPartial<RecruitmentPlan> & RecruitmentPlanExtraPayload): Promise<RecruitmentPlan> {
    const { positions, jobPositions, ...planInput } = data;

    const planData: DeepPartial<RecruitmentPlan> = {
      ...planInput,
      approvedBy: undefined,
      approvedAt: undefined,
      rejectionReason: undefined,
    };

    const plan = await super.create(planData);
    await this.syncPlanJobPositions(plan, { ...planInput, positions, jobPositions });
    await this.upsertRecruitmentApproval(plan, data);

    return plan;
  }

  async update(id: string, data: DeepPartial<RecruitmentPlan> & RecruitmentPlanExtraPayload): Promise<RecruitmentPlan> {
    const { positions, jobPositions, ...planInput } = data;

    if (data.status === RecruitmentPlanStatus.PLAN_REJECTED) {
      throw new BadRequestException('Không thể chuyển trạng thái sang Rejected tại màn hình chỉnh sửa kế hoạch');
    }

    const plan = await super.update(id, planInput);
    await this.syncPlanJobPositions(plan, { ...planInput, positions, jobPositions });

    if (
      plan.status === RecruitmentPlanStatus.PLAN_PENDING_APPROVAL ||
      plan.status === RecruitmentPlanStatus.PLAN_REQUEST_EDIT
    ) {
      await this.upsertRecruitmentApproval(plan, data);
    }

    return plan;
  }

  async submitForApproval(
    id: string,
    data?: DeepPartial<RecruitmentPlan> & RecruitmentPlanExtraPayload,
  ): Promise<RecruitmentPlan> {
    const { positions, jobPositions, ...planInput } = data || {};

    const plan = await super.update(id, {
      ...planInput,
      status: RecruitmentPlanStatus.PLAN_PENDING_APPROVAL,
      approvedBy: undefined,
      approvedAt: undefined,
      rejectionReason: undefined,
    });

    await this.syncPlanJobPositions(plan, { ...planInput, positions, jobPositions });
    await this.upsertRecruitmentApproval(plan, { ...planInput, positions, jobPositions });

    return plan;
  }

  async backfillActivePlansMissingJobPositions(): Promise<void> {
    const activePlans = await this.recruitmentPlanRepository.find({
      where: {
        status: RecruitmentPlanStatus.PLAN_ACTIVE,
      },
    });

    for (const plan of activePlans) {
      await this.syncPlanJobPositions(plan);
    }
  }

  async remove(id: string): Promise<void> {
    const plan = await this.recruitmentPlanRepository.findOne({
      where: { id },
    });

    if (!plan) {
      throw new BadRequestException('Plan not found');
    }

    await this.recruitmentPlanRepository.softDelete(id);
  }
}
