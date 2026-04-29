import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
  forwardRef,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { BaseService } from '../../../common/services/base.service';
import { Candidate } from '../entities/candidate.entity';
import { JobPosition } from '../entities/job-position.entity';
import { UsersService } from '../../auth/users.service';
import { InternService } from '../../training/services/intern.service';
import { MailerService } from '../../../providers/mailer/mailer.service';
import { CandidateStatus, InternStatus, RecruitmentPlanStatus } from '../../../common/constants/status.enum';
import { RoleName } from '../../../common/constants/roles.enum';

@Injectable()
export class CandidateService extends BaseService<Candidate> {
  constructor(
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
    @InjectRepository(JobPosition)
    private readonly jobPositionRepository: Repository<JobPosition>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => InternService))
    private readonly internService: InternService,
    private readonly mailerService: MailerService,
    private readonly dataSource: DataSource,
  ) {
    super(candidateRepository);
  }

  async findWithFilters(params: {
    q?: string;
    statuses?: string[];
    page?: number;
    pageSize?: number;
    jobId?: string;
    planId?: string;
    department?: string;
    ids?: string;
  }): Promise<{ data: Candidate[]; totalRows: number; page: number; pageSize: number }> {
    const page = Number.isFinite(params.page) && (params.page as number) > 0 ? (params.page as number) : 1;
    const pageSize =
      Number.isFinite(params.pageSize) && (params.pageSize as number) > 0
        ? Math.min(params.pageSize as number, 100)
        : 10;

    const queryBuilder = this.candidateRepository
      .createQueryBuilder('candidate')
      .leftJoinAndSelect('candidate.job', 'job')
      .leftJoinAndSelect('candidate.user', 'user')
      .orderBy('candidate.createdAt', 'DESC');

    if (params.ids) {
      const ids = params.ids.split(',');
      queryBuilder.andWhere('candidate.id IN (:...ids)', { ids });
    }
    if (params['department']) {
      queryBuilder.andWhere('job.department = :department', {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        department: params['department'],
      });
    }

    if (params['jobId']) {
      queryBuilder.andWhere('candidate.jobId = :jobId', { jobId: params['jobId'] });
    }

    if (params['planId']) {
      queryBuilder.andWhere('job.recruitmentPlanId = :planId', { planId: params['planId'] });
    }
    if (params.statuses && params.statuses.length > 0) {
      queryBuilder.andWhere('candidate.status IN (:...statuses)', { statuses: params.statuses });
    }

    const keyword = params.q?.trim();
    if (keyword) {
      queryBuilder.andWhere(
        '(candidate.fullName ILIKE :keyword OR candidate.email ILIKE :keyword OR candidate.phone ILIKE :keyword OR job.title ILIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    queryBuilder.skip((page - 1) * pageSize).take(pageSize);

    const [data, totalRows] = await queryBuilder.getManyAndCount();
    return { data, totalRows, page, pageSize };
  }

  async create(data: Partial<Candidate>): Promise<Candidate> {
    const jobId = data.jobId;
    if (!jobId) {
      throw new BadRequestException('Job ID is required');
    }

    const job = await this.jobPositionRepository.findOne({
      where: { id: jobId },
      relations: ['recruitmentPlan'],
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.status !== 'open' || job.recruitmentPlan?.status !== RecruitmentPlanStatus.PLAN_ACTIVE) {
      throw new BadRequestException('This job is no longer accepting applications');
    }

    const candidate = await super.create({
      ...data,
      appliedDate: new Date(),
      status: CandidateStatus.PENDING_REVIEW,
    } as any);

    return candidate;
  }

  private generateRandomPassword(length = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  private removeVietnameseAccents(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim();
  }

  private async generateSVTechEmail(fullName: string): Promise<string> {
    const cleanName = this.removeVietnameseAccents(fullName);
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return `intern_${Date.now()}@svtech.com.vn`;

    const firstName = parts.pop()!;
    let emailPrefix = firstName;
    for (const part of parts) {
      emailPrefix += part.charAt(0);
    }

    let emailStr = `${emailPrefix}@svtech.com.vn`;
    let count = 1;
    while (true) {
      const existing = await this.usersService.findByEmail(emailStr);
      if (!existing) {
        break;
      }
      emailStr = `${emailPrefix}${count}@svtech.com.vn`;
      count++;
    }
    return emailStr;
  }

  async updateStatus(id: string, status: CandidateStatus): Promise<Candidate> {
    return await this.update(id, { status } as any);
  }

  async updateResumeUrl(id: string, resumeUrl: string): Promise<Candidate> {
    return await this.update(id, { resumeUrl });
  }

  async getSummary(): Promise<Record<string, number>> {
    const rows = await this.candidateRepository
      .createQueryBuilder('c')
      .select('c.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('c.status')
      .getRawMany();

    const summary: Record<string, number> = { total: 0 };
    for (const row of rows) {
      summary[row.status] = Number(row.count);
      summary.total += Number(row.count);
    }

    // cv_dat = shortlisted + cv_screened
    summary['cv_dat'] = (summary['shortlisted'] || 0) + (summary['cv_screened'] || 0);

    return summary;
  }

  async getSummaryWithFilter(params: { jobId?: string; planId?: string }): Promise<Record<string, number>> {
    const qb = this.candidateRepository.createQueryBuilder('c').leftJoin('c.job', 'job');

    if (params.jobId) {
      qb.andWhere('c.jobId = :jobId', { jobId: params.jobId });
    }

    if (params.planId) {
      qb.andWhere('job.recruitmentPlanId = :planId', {
        planId: params.planId,
      });
    }

    const rows = await qb.select('c.status', 'status').addSelect('COUNT(*)', 'count').groupBy('c.status').getRawMany();

    const summary: Record<string, number> = { total: 0 };

    for (const row of rows) {
      summary[row.status] = Number(row.count);
      summary.total += Number(row.count);
    }

    summary['cv_dat'] = (summary['shortlisted'] || 0) + (summary['cv_screened'] || 0);

    return summary;
  }

  async convertToIntern(candidateId: string, mentorId: string, learningPathId?: string): Promise<any> {
    if (!mentorId?.trim()) {
      throw new BadRequestException('Mentor là bắt buộc');
    }

    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId },
      relations: ['job'],
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    if (candidate.status === CandidateStatus.CONVERTED_TO_INTERN) {
      throw new ConflictException('Ứng viên này đã được chuyển thành thực tập sinh rồi nhé!');
    }

    const existingIntern = await this.internService.findByCandidateId(candidate.id);
    if (existingIntern) {
      throw new ConflictException('Ứng viên này đã có hồ sơ thực tập sinh rồi nhé!');
    }

    // 0. Khởi tạo Username & Random Password
    const generatedEmail = await this.generateSVTechEmail(candidate.fullName);
    const generatedPassword = this.generateRandomPassword(8);

    // 1. Tạo User mới cho Intern
    const newUser = await this.usersService.create({
      email: generatedEmail, // Tài khoản svtech tự map
      fullName: candidate.fullName,
      password: generatedPassword,
      phone: candidate.phone,
      avatarUrl: candidate.avatarUrl,
      role: RoleName.TTS,
    } as any);

    // 2. Tạo bản ghi Intern
    const intern = await this.internService.create({
      userId: newUser.id,
      candidateId: candidate.id,
      learningPathId: learningPathId?.trim() || undefined,
      mentorId: mentorId,
      department: candidate.job?.department || 'R&D',
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // Mặc định 3 tháng
      status: InternStatus.ACTIVE,
    } as any);

    // 3. Cập nhật trạng thái Candidate
    candidate.status = CandidateStatus.CONVERTED_TO_INTERN;
    candidate.userId = newUser.id;
    await this.candidateRepository.save(candidate);

    // 4. Gửi email chứa username/password cho thực tập sinh (với email cá nhân lúc ứng tuyển)
    const emailBody = `
      <h3>Chúc mừng bạn đã chính thức trở thành Thực tập sinh tại SV Technologies JSC! 🎉</h3>
      <p>Chào <b>${candidate.fullName}</b>,</p>
      <p>Đây là thông tin tài khoản nội bộ của bạn để truy cập hệ thống dành cho Thực tập sinh:</p>
      <ul>
        <li>Username (Email công ty): <b>${generatedEmail}</b></li>
        <li>Password tạm thời: <b>${generatedPassword}</b></li>
      </ul>
      <p>Vui lòng đăng nhập và đổi mật khẩu bằng tính năng quản lý tài khoản trên cổng thông tin.</p>
      <p>Trân trọng,<br/>Bộ phận Tuyển dụng (HR) - SVTech</p>
    `;

    try {
      await this.mailerService.sendMail({
        to: candidate.email,
        subject: 'Thông tin tài khoản Cổng Thực Tập Sinh - SVTech',
        html: emailBody,
      });
    } catch (err) {
      console.error('[CandidateService] Lỗi gửi email tạo tài khoản Intern:', err);
    }

    return {
      message: 'Chúc mừng! Đã chuyển đổi ứng viên thành thực tập sinh thành công! 🎉',
      internId: intern.id,
      userId: newUser.id,
      newAccount: {
        username: generatedEmail,
        password: generatedPassword,
      },
    };
  }
}
