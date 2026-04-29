import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JobPositionService } from '../services/job-position.service';
import { RecruitmentPlanService } from '../services/recruitment-plan.service';
import { CreateJobPositionDto, UpdateJobPositionDto } from '../dto/job-position.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RecruitmentPlanStatus } from '../../../common/constants/status.enum';

@ApiTags('Recruitment - Job Positions')
@Controller('job-positions')
export class JobPositionController {
  constructor(
    private readonly service: JobPositionService,
    private readonly recruitmentPlanService: RecruitmentPlanService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tạo tin tuyển dụng mới' })
  create(@Body() dto: CreateJobPositionDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tin tuyển dụng (Công khai)' })
  async findAll(@Query() query: any) {
    const { status, q, department, public: publicMode } = query;
    const where: any = [];

    // Convert status from frontend "Open" to backend "open"
    const dbStatus = status ? status.toLowerCase() : undefined;
    const isPublicMode = String(publicMode || '').toLowerCase() === 'true' || String(publicMode || '') === '1';

    if (!isPublicMode) {
      await this.recruitmentPlanService.backfillActivePlansMissingJobPositions();
    }

    const baseCondition: any = {};
    if (isPublicMode) {
      baseCondition.status = 'open';
      baseCondition.recruitmentPlan = { status: RecruitmentPlanStatus.PLAN_ACTIVE };
    } else if (dbStatus) {
      baseCondition.status = dbStatus;
    }
    if (department) baseCondition.department = department;

    if (q) {
      const ILike = (await import('typeorm')).ILike;
      where.push({ ...baseCondition, title: ILike(`%${q}%`) });
      where.push({ ...baseCondition, description: ILike(`%${q}%`) });
    } else {
      where.push(baseCondition);
    }

    const data = await this.service.findAll({
      where,
      relations: ['recruitmentPlan', 'candidates'],
      order: { createdAt: 'DESC' },
    });

    return {
      hits: data.map((job) => ({
        ...job,
        totalApplications: job.candidates?.length || 0,
        campaign: job.recruitmentPlan?.name || 'N/A',
        campaignId: job.recruitmentPlan?.id,
        required: job.requiredQuantity || 0,
        filled: job.filledQuantity || 0,
        salary: job.salaryRange || 'Thỏa thuận',
        location: job.location || 'Hà Nội / TP.HCM',
        postedDate: job.postedDate ? new Date(job.postedDate).toLocaleDateString('vi-VN') : 'Mới đăng',
        deadline: job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : null,
        status:
          job.status === 'open'
            ? 'Open'
            : job.status === 'closed'
              ? 'Closed'
              : job.status === 'draft'
                ? 'Draft'
                : 'On Hold',
      })),
      pagination: {
        totalRows: data.length,
        totalPages: 1,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết tin tuyển dụng' })
  async findOne(@Param('id') id: string, @Query('public') publicMode?: string) {
    const job = await this.service.findOne(id, { relations: ['recruitmentPlan'] });
    const isPublicMode = String(publicMode || '').toLowerCase() === 'true' || String(publicMode || '') === '1';

    if (isPublicMode && (job.status !== 'open' || job.recruitmentPlan?.status !== RecruitmentPlanStatus.PLAN_ACTIVE)) {
      throw new NotFoundException('Job not found');
    }

    return {
      ...job,
      campaign: job.recruitmentPlan?.name || 'N/A',
      campaignId: job.recruitmentPlan?.id,
      required: job.requiredQuantity || 0,
      filled: job.filledQuantity || 0,
      salary: job.salaryRange || 'Thỏa thuận',
      location: job.location || 'Hà Nội / TP.HCM',
      postedDate: job.postedDate ? new Date(job.postedDate).toLocaleDateString('vi-VN') : 'Mới đăng',
      deadline: job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : null,
      status:
        job.status === 'open'
          ? 'Open'
          : job.status === 'closed'
            ? 'Closed'
            : job.status === 'draft'
              ? 'Draft'
              : 'On Hold',
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cập nhật tin tuyển dụng' })
  update(@Param('id') id: string, @Body() dto: UpdateJobPositionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Xóa tin tuyển dụng' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
