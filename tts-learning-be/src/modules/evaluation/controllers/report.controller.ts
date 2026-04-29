import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportService } from '../services/report.service';
import { CreateReportDto, UpdateReportDto } from '../dto/report.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Evaluation - Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportController {
  constructor(private readonly service: ReportService) {}

  @Post()
  @ApiOperation({ summary: 'Gửi báo cáo định kỳ (Intern)' })
  create(@Body() dto: CreateReportDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách báo cáo' })
  findAll() {
    return this.service.findAll({ relations: ['intern', 'reviewer'] });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết báo cáo' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id, { relations: ['intern', 'reviewer'] });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Phản hồi/Chấm điểm báo cáo (Mentor/Admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateReportDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa báo cáo' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
