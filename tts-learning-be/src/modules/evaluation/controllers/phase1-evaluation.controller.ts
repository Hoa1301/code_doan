import { Body, Controller, ForbiddenException, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { RoleName } from '@/common/constants/roles.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { InternService } from '@/modules/training/services/intern.service';
import { UpsertPhase1ModuleEvaluationDto } from '../dto/phase1-module-evaluation.dto';
import { Phase1EvaluationService } from '../services/phase1-evaluation.service';

@ApiTags('Evaluation - Phase 1 By Module')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('evaluations')
export class Phase1EvaluationController {
  constructor(
    private readonly phase1EvaluationService: Phase1EvaluationService,
    private readonly internService: InternService,
  ) {}

  @Get('intern/:internId/phase1/modules')
  @ApiOperation({ summary: 'Lấy dữ liệu đánh giá giai đoạn 1 theo từng học phần' })
  async getPhase1Detail(@Param('internId') internId: string, @CurrentUser() user: { id: string; role?: string }) {
    await this.ensurePhase1ReadAccess(user, internId);
    return this.phase1EvaluationService.getPhase1Detail(internId);
  }

  @Put('intern/:internId/phase1/modules/:moduleId')
  @ApiOperation({ summary: 'Tạo hoặc cập nhật đánh giá giai đoạn 1 cho một học phần' })
  async upsertModuleEvaluation(
    @Param('internId') internId: string,
    @Param('moduleId') moduleId: string,
    @Body() dto: UpsertPhase1ModuleEvaluationDto,
    @CurrentUser() user: { id: string; role?: string },
  ) {
    await this.ensurePhase1WriteAccess(user, internId);
    return this.phase1EvaluationService.upsertModuleEvaluation(internId, moduleId, user.id, dto);
  }

  private normalizeRole(role?: string): string {
    return String(role || '').trim().toLowerCase();
  }

  private async ensurePhase1ReadAccess(user: { id: string; role?: string }, internId: string): Promise<void> {
    const normalizedRole = this.normalizeRole(user?.role);

    if ([RoleName.ADMIN, RoleName.SUPER_ADMIN].includes(normalizedRole as RoleName)) {
      return;
    }

    if (normalizedRole === RoleName.TTS) {
      const intern = await this.internService.findByUserId(user.id);
      if (intern.id !== internId) {
        throw new ForbiddenException('Bạn không có quyền xem dữ liệu đánh giá này');
      }
      return;
    }

    if (normalizedRole === RoleName.MENTOR) {
      const intern = await this.internService.findOne(internId);
      if (intern.mentorId !== user.id) {
        throw new ForbiddenException('Bạn không phụ trách thực tập sinh này');
      }
      return;
    }

    throw new ForbiddenException('Bạn không có quyền xem dữ liệu đánh giá này');
  }

  private async ensurePhase1WriteAccess(user: { id: string; role?: string }, internId: string): Promise<void> {
    const normalizedRole = this.normalizeRole(user?.role);

    if ([RoleName.ADMIN, RoleName.SUPER_ADMIN].includes(normalizedRole as RoleName)) {
      return;
    }

    if (normalizedRole === RoleName.MENTOR) {
      const intern = await this.internService.findOne(internId);
      if (intern.mentorId !== user.id) {
        throw new ForbiddenException('Bạn không phụ trách thực tập sinh này');
      }
      return;
    }

    throw new ForbiddenException('Bạn không có quyền chấm đánh giá giai đoạn 1');
  }
}
