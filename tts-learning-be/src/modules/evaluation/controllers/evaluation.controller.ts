import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EvaluationService } from '../services/evaluation.service';
import { CreateEvaluationDto, UpdateEvaluationDto } from '../dto/evaluation.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Evaluation - Evaluations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('evaluations')
export class EvaluationController {
  constructor(private readonly service: EvaluationService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo phiếu đánh giá mới cho thực tập sinh' })
  create(@Body() dto: CreateEvaluationDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả phiếu đánh giá' })
  findAll() {
    return this.service.findAll({ relations: ['intern', 'mentor'] });
  }

  @Get('intern/:internId')
  @ApiOperation({ summary: 'Lấy tất cả đánh giá của một thực tập sinh theo từng giai đoạn' })
  findByIntern(@Param('internId') internId: string) {
    return this.service.findByIntern(internId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết phiếu đánh giá' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id, { relations: ['intern', 'mentor'] });
  }

  @Patch(':id/decision')
  @ApiOperation({ summary: 'Chốt kết quả đánh giá (Decision)' })
  updateDecision(@Param('id') id: string, @Body() body: { decision: string; decisionReason: string }) {
    return this.service.updateDecision(id, body.decision, body.decisionReason);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật phiếu đánh giá' })
  update(@Param('id') id: string, @Body() dto: UpdateEvaluationDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa phiếu đánh giá' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
