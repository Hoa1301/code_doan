import { Body, Controller, ForbiddenException, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { RoleName } from '@/common/constants/roles.enum';
import { InternService } from '../services/intern.service';
import { SubmitModuleFinalTestDto, UpsertModuleFinalTestDto } from '../dto/module-final-test.dto';
import { ModuleFinalTestService } from '../services/module-final-test.service';

@ApiTags('Training - Module Final Tests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('module-final-tests')
export class ModuleFinalTestController {
  constructor(
    private readonly moduleFinalTestService: ModuleFinalTestService,
    private readonly internService: InternService,
  ) {}

  @Get('module/:moduleId')
  @ApiOperation({ summary: 'Lấy thông tin bài kiểm tra cuối học phần' })
  async getByModule(@Param('moduleId') moduleId: string, @CurrentUser() user: { id: string; role?: string }) {
    const role = this.normalizeRole(user?.role);

    if (role === RoleName.TTS) {
      const intern = await this.internService.findByUserId(user.id);
      return this.moduleFinalTestService.getByModule(moduleId, intern.id);
    }

    return this.moduleFinalTestService.getByModule(moduleId);
  }

  @Put('module/:moduleId')
  @ApiOperation({ summary: 'Tạo hoặc cập nhật bài kiểm tra cuối học phần' })
  async upsertByModule(
    @Param('moduleId') moduleId: string,
    @Body() dto: UpsertModuleFinalTestDto,
    @CurrentUser() user: { role?: string },
  ) {
    this.ensureMentorAccess(user?.role);
    return this.moduleFinalTestService.upsertByModule(moduleId, dto);
  }

  @Put('module/:moduleId/submission/me')
  @ApiOperation({ summary: 'Thực tập sinh nộp bài kiểm tra cuối học phần của mình' })
  async submitMine(
    @Param('moduleId') moduleId: string,
    @Body() dto: SubmitModuleFinalTestDto,
    @CurrentUser() user: { id: string; role?: string },
  ) {
    this.ensureInternAccess(user?.role);
    const intern = await this.internService.findByUserId(user.id);
    return this.moduleFinalTestService.upsertSubmission(moduleId, intern.id, dto);
  }

  private normalizeRole(role?: string): string {
    return String(role || '').trim().toLowerCase();
  }

  private ensureMentorAccess(role?: string): void {
    const normalizedRole = this.normalizeRole(role);
    const allowedRoles = [RoleName.MENTOR, RoleName.ADMIN, RoleName.SUPER_ADMIN];

    if (!allowedRoles.includes(normalizedRole as RoleName)) {
      throw new ForbiddenException('Bạn không có quyền quản lý bài kiểm tra cuối học phần');
    }
  }

  private ensureInternAccess(role?: string): void {
    if (this.normalizeRole(role) !== RoleName.TTS) {
      throw new ForbiddenException('Chỉ thực tập sinh mới có thể nộp bài của mình');
    }
  }
}
