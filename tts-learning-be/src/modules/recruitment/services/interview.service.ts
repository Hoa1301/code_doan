import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../../common/services/base.service';
import { Interview } from '../entities/interview.entity';
import { CandidateService } from './candidate.service';
import { CandidateStatus, InterviewStatus } from '../../../common/constants/status.enum';
import { randomUUID } from 'crypto';

@Injectable()
export class InterviewService extends BaseService<Interview> {
  constructor(
    @InjectRepository(Interview)
    private readonly interviewRepository: Repository<Interview>,
    private readonly candidateService: CandidateService,
  ) {
    super(interviewRepository);
  }

  async create(dto: any): Promise<Interview> {
    if (!dto.infoMeeting) {
      throw new BadRequestException('Vui lòng nhập thông tin buổi phỏng vấn');
    }

    const start = new Date(dto.start);
    const end = new Date(dto.end);

    const isConflict = await this.isConflict(start, end);
    if (isConflict) {
      throw new BadRequestException('Khung giờ đã có lịch phỏng vấn');
    }

    const interview = await super.create({
      ...dto,
      format: dto.format || 'in_person',
    });

    // Automatically update candidate status when interview is scheduled
    if (dto.candidateId) {
      await this.candidateService.updateStatus(dto.candidateId, CandidateStatus.INTERVIEW_SCHEDULED);
    }

    return interview;
  }

  /**
   * Tạo hàng loạt lịch phỏng vấn, tự tính giờ cho mỗi ứng viên
   * startTime: "13:00", intervalMinutes: 30
   * → candidate 0: 13:00, candidate 1: 13:30, candidate 2: 14:00...
   */
  async createBatch(dto: {
    candidateIds: string[];
    jobId: string;
    interviewDate: string;
    startTime: string;
    intervalMinutes: number;
    format: string;
    location?: string;
    interviewerId?: string;
  }): Promise<{ interviews: Interview[]; schedule: { candidateId: string; time: string }[] }> {
    const [startHour, startMinute] = dto.startTime.split(':').map(Number);
    const interviews: Interview[] = [];
    const schedule: { candidateId: string; time: string }[] = [];

    for (let i = 0; i < dto.candidateIds.length; i++) {
      const totalMinutes = startHour * 60 + startMinute + i * dto.intervalMinutes;
      const hour = Math.floor(totalMinutes / 60);
      const minute = totalMinutes % 60;
      const interviewTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

      const interview = await this.create({
        candidateId: dto.candidateIds[i],
        jobId: dto.jobId,
        interviewDate: dto.interviewDate,
        interviewTime,
        durationMinutes: dto.intervalMinutes,
        format: dto.format,
        location: dto.location,
        interviewerId: dto.interviewerId,
      });

      interviews.push(interview);
      schedule.push({ candidateId: dto.candidateIds[i], time: interviewTime });
    }

    return { interviews, schedule };
  }

  private async isConflict(start: Date, end: Date) {
    const count = await this.interviewRepository
      .createQueryBuilder('i')
      .where('i.start < :end AND i.end > :start', { start, end })
      .getCount();

    return count > 0;
  }

  async update(id: string, dto: any) {
    const old = await this.findOne(id);

    if (!old) {
      throw new NotFoundException('Interview not found');
    }

    if (!dto.infoMeeting) {
      throw new BadRequestException('Vui lòng nhập thông tin buổi phỏng vấn');
    }

    const start = new Date(dto.start);
    const end = new Date(dto.end);

    const conflict = await this.interviewRepository
      .createQueryBuilder('i')
      .where('i.id != :id', { id })
      .andWhere('i.start < :end AND i.end > :start', { start, end })
      .getCount();

    if (conflict > 0) {
      throw new BadRequestException('Khung giờ đã có lịch');
    }

    if (dto.candidateId && dto.candidateId !== old.candidateId) {
      await this.candidateService.updateStatus(old.candidateId, CandidateStatus.SHORTLISTED);

      await this.candidateService.updateStatus(dto.candidateId, CandidateStatus.INTERVIEW_SCHEDULED);
    }

    return super.update(id, dto);
  }

  async updateStatusPublic(id: string, status: InterviewStatus) {
    const interview = await this.findOne(id);

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    interview.status = status;
    await this.interviewRepository.save(interview);

    return interview;
  }

  async generateActionToken(interviewId: string) {
    const interview = await this.findOne(interviewId);

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    const token = randomUUID();

    interview.actionToken = token;
    interview.tokenUsed = false;

    await this.interviewRepository.save(interview);

    return token;
  }

  async handleTokenAction(token: string, status: InterviewStatus) {
    const interview = await this.interviewRepository.findOne({
      where: { actionToken: token },
    });

    if (!interview) {
      return { success: false, message: 'Token không hợp lệ' };
    }

    if (interview.tokenUsed) {
      return { success: false, message: 'Link đã được sử dụng' };
    }

    interview.status = status;
    interview.tokenUsed = true;

    await this.interviewRepository.save(interview);

    return { success: true, message: 'Thành công' };
  }
  
  async updateStatus(id: string, status: InterviewStatus) {
    const interview = await this.findOne(id);

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    interview.status = status;

    return this.interviewRepository.save(interview);
  }
}
