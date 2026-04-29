import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, QueryFailedError, Repository } from 'typeorm';
import { BaseService } from '../../../common/services/base.service';
import { JobPosition } from '../entities/job-position.entity';
import { CreateJobPositionDto, UpdateJobPositionDto } from '../dto/job-position.dto';
import { JobPositionStatus } from '../../../common/constants/status.enum';

@Injectable()
export class JobPositionService extends BaseService<JobPosition> {
  private static readonly JOB_CODE_UNIQUE_CONSTRAINT = 'UQ_63cb5feb8df11985f3a9adafc6f';
  private static readonly MAX_RETRIES = 5;

  constructor(
    @InjectRepository(JobPosition)
    private readonly jobPositionRepository: Repository<JobPosition>,
  ) {
    super(jobPositionRepository);
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
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

    return code === '23505' && constraint === JobPositionService.JOB_CODE_UNIQUE_CONSTRAINT;
  }

  // Bổ sung thêm hàm sinh mã JOB tự động nếu cần
  async create(data: CreateJobPositionDto): Promise<JobPosition> {
    const incomingStatus = (data as Partial<{ status: JobPositionStatus }>).status;
    const postedDate = incomingStatus === JobPositionStatus.JOB_OPEN ? new Date() : undefined;

    for (let attempt = 0; attempt < JobPositionService.MAX_RETRIES; attempt += 1) {
      const latestIndex = await this.getLatestJobCodeIndex();
      const code = `JOB-${(latestIndex + 1).toString().padStart(3, '0')}`;
      const payload: DeepPartial<JobPosition> = { ...data, code, postedDate };

      try {
        return await super.create(payload);
      } catch (error) {
        const isLastAttempt = attempt === JobPositionService.MAX_RETRIES - 1;
        if (!this.isJobCodeUniqueViolation(error) || isLastAttempt) {
          throw error;
        }

        await this.sleep(25 + Math.floor(Math.random() * 25));
      }
    }

    throw new ConflictException('Duplicate job code detected. Please retry.');
  }

  async update(id: string, data: UpdateJobPositionDto): Promise<JobPosition> {
    const patch: DeepPartial<JobPosition> = { ...data };

    if (data.status === JobPositionStatus.JOB_OPEN) {
      const current = await this.findOne(id);
      if (!current.postedDate) {
        patch.postedDate = new Date();
      }
    }

    return super.update(id, patch);
  }
}
