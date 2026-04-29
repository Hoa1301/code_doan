import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RecruitmentPlanService } from '../services/recruitment-plan.service';
import { CreateRecruitmentPlanDto, UpdateRecruitmentPlanDto } from '../dto/recruitment-plan.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Recruitment - Plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recruitment-plans')
export class RecruitmentPlanController {
  constructor(private readonly service: RecruitmentPlanService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo kế hoạch tuyển dụng mới' })
  create(@Body() dto: CreateRecruitmentPlanDto) {
    return this.service.create(dto);
  }

  @Get()
  async findAll() {
    await this.service.backfillActivePlansMissingJobPositions();
    const data = await this.service.findAll({ relations: ['jobPositions'] });

    const approvals = await this.service['approvalRepository'].find({
      where: { type: 'Recruitment' },
      order: { createdAt: 'DESC' },
    });

    const approvalMap = approvals.reduce((acc: any, a: any) => {
      if (!acc[a.entityId]) {
        acc[a.entityId] = a;
      }
      return acc;
    }, {});

    return {
      hits: data.map((plan) => {
        const approval = approvalMap[plan.id];

        let jobPositions = approval?.details?.positions?.length ? approval.details.positions : [];

        if (!jobPositions.length && plan.jobPositions?.length) {
          jobPositions = plan.jobPositions.map((jp) => ({
            title: jp.title,
            department: jp.department,
            count: jp.requiredQuantity,
            requirements: jp.requirements,
          }));
        }

        return {
          ...plan,
          jobPositions,
          candidates: plan.jobPositions?.reduce((acc, job) => acc + (job.filledQuantity || 0), 0) || 0,
        };
      }),
      pagination: {
        totalRows: data.length,
        totalPages: 1,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết kế hoạch' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id, { relations: ['jobPositions'] });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin kế hoạch tuyển dụng' })
  update(@Param('id') id: string, @Body() dto: UpdateRecruitmentPlanDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/submit')
  @ApiOperation({ summary: 'Gửi (hoặc gửi lại) kế hoạch để Director phê duyệt' })
  submit(@Param('id') id: string, @Body() dto: Partial<UpdateRecruitmentPlanDto>) {
    return this.service.submitForApproval(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa kế hoạch' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
