import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InternService } from '../services/intern.service';
import { CreateInternDto, MentorUpdateInternDto, UpdateInternDto } from '../dto/intern.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { RoleName } from '../../../common/constants/roles.enum';
import { StorageService } from '@/common/storage/storage.service';
import { Response } from 'express';
import { Res } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@ApiTags('Training - Interns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('interns')
export class InternController {
  constructor(
    private readonly service: InternService,
    private readonly storageService: StorageService,
  ) {}

  private getLatestProgress(intern: any) {
    return [...(intern?.progress || [])].sort((left: any, right: any) => {
      const rightTime = new Date(right?.updatedAt || right?.createdAt || 0).getTime();
      const leftTime = new Date(left?.updatedAt || left?.createdAt || 0).getTime();
      return rightTime - leftTime;
    })[0];
  }

  private async toInternResponse(intern: any) {
    const latestProgress = this.getLatestProgress(intern);
    const normalizedStatus = String(intern?.status || '');
    let avatarUrl = intern.user?.avatarUrl;

    if (avatarUrl && !avatarUrl.startsWith('http')) {
      avatarUrl = await this.storageService.getFileUrl(avatarUrl);
    }
    return {
      ...intern,
      name: intern.user?.fullName,
      fullName: intern.user?.fullName,
      avatarUrl,
      email: intern.user?.email,
      mentorName: intern.mentor?.fullName || 'N/A',
      status: normalizedStatus
        ? normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)
        : normalizedStatus,
      learningPathId: latestProgress?.learningPathId,
      learningPath: latestProgress?.learningPath,
    };
  }

  @Get('me')
  @ApiOperation({ summary: 'Lấy thông tin cá nhân của TTS đang đăng nhập' })
  async getMe(@CurrentUser() user: any) {
    const intern = await this.service.findByUserId(user.id);
    return this.service.findOne(intern.id, { relations: ['user', 'mentor', 'candidate', 'tasks', 'reports'] });
  }

  @Get('me/progress')
  @ApiOperation({ summary: 'Lấy tiến độ học tập cá nhân (Dành cho TTS)' })
  async getMyProgress(@CurrentUser() user: any) {
    const intern = await this.service.findByUserId(user.id);
    return this.service.getProgress(intern.id);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Lấy tiến độ học tập của TTS theo ID' })
  getProgress(@Param('id') id: string) {
    return this.service.getProgress(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo hồ sơ thực tập sinh mới' })
  create(@Body() dto: CreateInternDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thực tập sinh' })
  async findAll(@CurrentUser() user: { id: string; role?: string }) {
    const currentRole = String(user?.role || '').toLowerCase();
    const canViewAll = currentRole === RoleName.ADMIN || currentRole === RoleName.SUPER_ADMIN;
    const isMentor = currentRole === RoleName.MENTOR;

    if (!canViewAll && !isMentor) {
      throw new ForbiddenException('Bạn không có quyền xem danh sách thực tập sinh');
    }

    const data = await this.service.findAll({
      where: isMentor ? { mentorId: user.id } : undefined,
      relations: ['user', 'mentor', 'candidate', 'evaluations', 'progress', 'progress.learningPath'],
    });
    return {
      hits: await Promise.all(data.map((intern) => this.toInternResponse(intern))),
      pagination: {
        totalRows: data.length,
        totalPages: 1,
      },
    };
  }

  @Get('export')
  @ApiOperation({ summary: 'Export danh sách thực tập sinh ra Excel' })
  async exportExcel(
    @CurrentUser() user: { id: string; role?: string },
    @Res() res: Response,
    @Query('excludeColumns') excludeColumns?: string,
  ) {
    try {
      const currentRole = String(user?.role || '').toLowerCase();

      const canViewAll = currentRole === 'admin' || currentRole === 'super_admin';
      const isMentor = currentRole === 'mentor';

      if (!canViewAll && !isMentor) {
        throw new ForbiddenException('Bạn không có quyền export');
      }

      const data = await this.service.findAll({
        where: isMentor ? { mentorId: user.id } : undefined,
        relations: ['user', 'mentor', 'progress'],
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Interns');
      const excludedColumns = new Set(
        String(excludeColumns || '')
          .split(',')
          .map((column) => column.trim().toLowerCase())
          .filter(Boolean),
      );

      worksheet.columns = [
        { header: 'Mã TTS', key: 'code', width: 15 },
        { header: 'Họ tên', key: 'fullName', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Mentor', key: 'mentor', width: 25 },
        { header: 'Phòng ban', key: 'department', width: 20 },
        { header: 'Trạng thái', key: 'status', width: 15 },
        { header: 'Start Date', key: 'startDate', width: 15 },
        { header: 'End Date', key: 'endDate', width: 15 },
      ];

      for (const intern of data) {
        const latestProgress = [...(intern.progress || [])].sort(
          (a: any, b: any) =>
            new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime(),
        )[0];

        worksheet.addRow({
          code: intern.code,
          fullName: intern.user?.fullName,
          email: intern.user?.email,
          mentor: intern.mentor?.fullName,
          department: intern.department,
          status: intern.status,
          startDate: intern.startDate,
          endDate: intern.endDate,
        });
      }

      worksheet.getRow(1).font = { bold: true };

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      res.setHeader('Content-Disposition', 'attachment; filename=interns.xlsx');

      await workbook.xlsx.write(res);
      res.end();
    } catch (error: any) {
      console.error('EXPORT ERROR:', error);

      if (!res.headersSent) {
        res.status(error?.status || 500).json({
          message: error?.message || 'Xuất Excel thất bại',
        });
      } else {
        res.end();
      }
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết thực tập sinh' })
  async findOne(@Param('id') id: string, @CurrentUser() user: { id: string; role?: string }) {
    const currentRole = String(user?.role || '').toLowerCase();

    if (currentRole === RoleName.MENTOR) {
      const scopedIntern = await this.service.findOneForMentor(id, user.id, {
        relations: ['user', 'mentor', 'candidate', 'tasks', 'reports', 'progress', 'progress.learningPath'],
      });

      return this.toInternResponse(scopedIntern);
    }

    try {
      const intern = await this.service.findOne(id, {
        relations: ['user', 'mentor', 'candidate', 'tasks', 'reports', 'progress', 'progress.learningPath'],
      });
      return this.toInternResponse(intern);
    } catch (e) {
      // Nếu không tìm thấy bằng ID, thử tìm bằng code
      const intern = await this.service.findAll({
        where: { code: id },
        relations: ['user', 'mentor', 'candidate', 'tasks', 'reports', 'progress', 'progress.learningPath'],
      });
      if (intern.length > 0) return this.toInternResponse(intern[0]);
      throw e;
    }
  }

  @Patch(':id/mentor-management')
  @ApiOperation({ summary: 'Mentor updates allowed intern fields' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  async updateByMentor(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role?: string },
    @Body() dto: MentorUpdateInternDto,
  ) {
    const currentRole = String(user?.role || '').toLowerCase();

    if (currentRole !== RoleName.MENTOR) {
      throw new ForbiddenException('Only mentors can use this endpoint');
    }

    await this.service.updateMentorManagedFields(id, user.id, dto);

    const intern = await this.service.findOneForMentor(id, user.id, {
      relations: ['user', 'mentor', 'candidate', 'tasks', 'reports', 'progress', 'progress.learningPath'],
    });

    return this.toInternResponse(intern);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin/tiến độ thực tập sinh' })
  update(@Param('id') id: string, @CurrentUser() user: { id: string; role?: string }, @Body() dto: UpdateInternDto) {
    const currentRole = String(user?.role || '').toLowerCase();

    if (currentRole === RoleName.MENTOR) {
      throw new ForbiddenException('Mentors must use the scoped management endpoint');
    }

    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa hồ sơ thực tập sinh' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
