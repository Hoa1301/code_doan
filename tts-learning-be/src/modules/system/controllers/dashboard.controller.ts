import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Candidate } from '../../recruitment/entities/candidate.entity';
import { Intern } from '../../training/entities/intern.entity';
import { JobPosition } from '../../recruitment/entities/job-position.entity';
import { Interview } from '../../recruitment/entities/interview.entity';
import { Evaluation } from '../../evaluation/entities/evaluation.entity';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CandidateStatus, InternStatus, JobPositionStatus } from '../../../common/constants/status.enum';

@ApiTags('System - Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboardStats')
export class DashboardController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
    @InjectRepository(Intern)
    private readonly internRepository: Repository<Intern>,
    @InjectRepository(JobPosition)
    private readonly jobRepository: Repository<JobPosition>,
    @InjectRepository(Interview)
    private readonly interviewRepository: Repository<Interview>,
    @InjectRepository(Evaluation)
    private readonly evaluationRepository: Repository<Evaluation>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lấy các thông số thống kê Dashboard' })
  async getStats() {
    const [totalUsers, activeInterns, openPositions, totalApplications, pendingApplications, upcomingInterviews, convertedInterns] =
      await Promise.all([
      this.userRepository.count(),
      this.internRepository.count({ where: { status: InternStatus.ACTIVE } }),
      this.jobRepository.count({ where: { status: JobPositionStatus.JOB_OPEN as any } }),
      this.candidateRepository.count(),
      this.candidateRepository.count({
        where: { status: CandidateStatus.PENDING_REVIEW },
      }),
      this.interviewRepository.count({
        where: { interviewDate: MoreThan(new Date()) },
      }),
      this.candidateRepository.count({
        where: { status: CandidateStatus.CONVERTED_TO_INTERN },
      }),
    ]);

    const conversionRate = totalApplications > 0 ? Math.round((convertedInterns / totalApplications) * 100) : 0;

    return {
      totalUsers,
      activeUsers: Math.floor(totalUsers * 0.8), // Mock
      todayVisits: Math.floor(Math.random() * 100), // Mock
      activeInterns,
      openPositions,
      totalApplications,
      pendingApplications,
      upcomingInterviews,
      pendingReviews: pendingApplications,
      convertedInterns,
      conversionRate,
    };
  }
}
