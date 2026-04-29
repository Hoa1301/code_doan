import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LearningPathService } from '../services/learning-path.service';
import { CreateLearningPathDto, UpdateLearningPathDto } from '../dto/learning-path.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Training - Learning Paths')
@Controller('learning-paths')
export class LearningPathController {
  constructor(private readonly service: LearningPathService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tạo lộ trình học tập mới' })
  create(@Body() dto: CreateLearningPathDto) {
    return this.service.create(dto);
  }

  @Get('track/:track')
  @ApiOperation({ summary: 'Lấy lộ trình học theo chuyên ngành (Track)' })
  findByTrack(@Param('track') track: string) {
    return this.service.findByTrack(track);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách lộ trình học (Công khai)' })
  async findAll() {
    const data = await this.service.findAll({ relations: ['modules', 'modules.contents', 'modules.quizzes'] });
    return {
      hits: data,
      pagination: {
        totalRows: data.length,
        totalPages: 1,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết lộ trình học' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id, { relations: ['modules', 'modules.contents', 'modules.quizzes'] });
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cập nhật lộ trình học' })
  update(@Param('id') id: string, @Body() dto: UpdateLearningPathDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Xóa lộ trình học' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
