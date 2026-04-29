import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CreateModuleDto, ReorderModulesDto, UpdateModuleDto } from '../dto/module.dto';
import { TrainingModuleService } from '../services/module.service';

@ApiTags('Training - Modules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('modules')
export class TrainingModuleController {
  constructor(private readonly service: TrainingModuleService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo học phần mới cho lộ trình' })
  create(@Body() dto: CreateModuleDto) {
    return this.service.create(dto);
  }

  @Get('learning-path/:learningPathId')
  @ApiOperation({ summary: 'Lấy danh sách học phần theo lộ trình' })
  findByLearningPath(@Param('learningPathId') learningPathId: string) {
    return this.service.findByLearningPath(learningPathId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật học phần' })
  update(@Param('id') id: string, @Body() dto: UpdateModuleDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa học phần' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Put('learning-path/:learningPathId/order')
  @ApiOperation({ summary: 'Cập nhật thứ tự học phần trong lộ trình' })
  reorder(@Param('learningPathId') learningPathId: string, @Body() dto: ReorderModulesDto) {
    return this.service.reorder(learningPathId, dto);
  }
}
