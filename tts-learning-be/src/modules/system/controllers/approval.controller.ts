import {
  BadRequestException,
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { FindOptionsWhere, ILike } from 'typeorm';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApprovalService } from '../services/approval.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Approval } from '../entities/approval.entity';
import { ApprovalUpdatePayload } from '../services/approval.service';
import { RecruitmentPlanStatus } from '@/common/constants/status.enum';

type ApprovalListQuery = {
  status?: string;
  type?: string;
  q?: string;
};

type ApprovalActionRequest = {
  status?: string;
  notes?: string;
  note?: string;
  action?: string;
  reason?: string;
  comment?: string;
};

@ApiTags('System - Approvals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('approvals')
export class ApprovalController {
  constructor(private readonly service: ApprovalService) {}

  private normalizeStatusValue(value?: string): Approval['status'] | undefined {
    if (!value) return undefined;
    const normalized = value
      .toLowerCase()
      .trim()
      .replace(/[\s-]+/g, '_');

    if (normalized === 'pending') return 'Pending';
    if (normalized === 'approved' || normalized === 'approve') return 'Approved';
    if (normalized === 'rejected' || normalized === 'reject') return 'Rejected';
    if (
      normalized === 'adjusting' ||
      normalized === 'adjust' ||
      normalized === 'request_changes' ||
      normalized === 'requested_changes' ||
      normalized === 'changes_requested'
    ) {
      return 'Adjusting';
    }
    return undefined;
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách yêu cầu phê duyệt (Dành cho Giám đốc)' })
  async findAll(@Query() query: ApprovalListQuery) {
    const { status, type, q } = query;
    const where: FindOptionsWhere<Approval>[] = [];

    const normalizedStatus = this.normalizeStatusValue(status);

    const baseCondition: FindOptionsWhere<Approval> = {};
    if (normalizedStatus) baseCondition.status = normalizedStatus;
    if (type && type !== 'all') baseCondition.type = type as Approval['type'];

    if (q) {
      where.push({ ...baseCondition, name: ILike(`%${q}%`) });
      where.push({ ...baseCondition, title: ILike(`%${q}%`) });
    } else {
      where.push(baseCondition);
    }

    const data = await this.service.findAll({
      where,
      order: { createdAt: 'DESC' },
    });

    const enriched = await Promise.all(
      data.map(async (item) => {
        let planStatus: RecruitmentPlanStatus | null = null;
        let positions: any[] = [];

        if (item.type === 'Recruitment' && item.entityId) {
          const plan = await this.service['planRepository'].findOne({
            where: { id: item.entityId },
            select: ['status'],
          });

          planStatus = plan?.status ?? null;
        }

        if (item.details?.positions) {
          positions = item.details.positions;
        }

        return {
          ...item,
          status: this.normalizeStatusValue(item.status) || item.status,
          planStatus,
          positions,
        };
      }),
    );

    return {
      hits: enriched,
      pagination: {
        totalRows: enriched.length,
        totalPages: 1,
      },
    };

    return {
      hits: data.map((item) => ({
        ...item,
        status: this.normalizeStatusValue(item.status) || item.status,
      })),
      pagination: {
        totalRows: data.length,
        totalPages: 1,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết yêu cầu phê duyệt' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật trạng thái phê duyệt (Approve/Reject)' })
  update(
    @Param('id') id: string,
    @Body() dto: ApprovalActionRequest,
    @CurrentUser() user: { id?: string; sub?: string },
  ) {
    const normalizedStatus = this.normalizeStatusValue(dto.status || dto.action);
    if (!normalizedStatus) {
      throw new BadRequestException('Invalid approval status');
    }

    if (normalizedStatus === 'Pending') {
      throw new BadRequestException('Pending is not a valid action status');
    }

    const approverId = user?.id;

    if (!approverId) {
      throw new UnauthorizedException('User ID not found in token');
    }

    const payload: ApprovalUpdatePayload = {
      status: normalizedStatus,
      notes: dto.notes || dto.note || dto.reason || dto.comment,
      approverId,
    };

    return this.service.update(id, payload);
  }
}
