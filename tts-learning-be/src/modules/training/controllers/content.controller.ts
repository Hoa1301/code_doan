import { Controller, Get, Post, Body, Param, UseGuards, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ModuleContentService } from '../services/content.service';
import { CreateModuleContentDto, UpdateModuleContentDto } from '../dto/content.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Training - Content')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('training-content')
export class TrainingContentController {
  constructor(private readonly contentService: ModuleContentService) {}

  @Post('contents')
  @ApiOperation({ summary: 'Thêm tài liệu học tập mới (Video/PDF...)' })
  async createContent(@Body() dto: CreateModuleContentDto) {
    const orderIndex = await this.contentService.getNextOrderIndex(dto.moduleId);
    const metadata: Record<string, unknown> = {};
    if (typeof dto.durationMinutes === 'number') {
      metadata.durationMinutes = dto.durationMinutes;
    }
    if (dto.assessmentFileUrl) {
      metadata.assessmentFileUrl = dto.assessmentFileUrl;
    }
    if (Array.isArray(dto.documentUrls) && dto.documentUrls.length > 0) {
      metadata.documentUrls = dto.documentUrls;
    }

    return this.contentService.create({
      ...dto,
      metadata: Object.keys(metadata).length ? metadata : undefined,
      orderIndex,
    } as any);
  }

  @Get('contents/:moduleId')
  @ApiOperation({ summary: 'Lấy danh sách tài liệu theo module' })
  findContentByModule(@Param('moduleId') moduleId: string) {
    return this.contentService.findAll({ where: { module: { id: moduleId } } as any });
  }

  @Patch('contents/:id')
  @ApiOperation({ summary: 'Cập nhật tài liệu học tập' })
  async updateContent(@Param('id') id: string, @Body() dto: UpdateModuleContentDto) {
    const existingContent = await this.contentService.findOne(id);
    const existingMetadata =
      typeof existingContent?.metadata === 'object' && existingContent.metadata !== null
        ? (existingContent.metadata as Record<string, unknown>)
        : {};

    const patch: Record<string, unknown> = {
      moduleId: dto.moduleId,
      type: dto.type,
      title: dto.title,
      contentUrl: dto.contentUrl,
      metadata: {
        ...existingMetadata,
      },
    };

    if (typeof dto.durationMinutes === 'number') {
      patch.metadata = {
        ...(patch.metadata as Record<string, unknown>),
        durationMinutes: dto.durationMinutes,
      };
    }

    if (typeof dto.assessmentFileUrl === 'string') {
      patch.metadata = {
        ...(patch.metadata as Record<string, unknown>),
        assessmentFileUrl: dto.assessmentFileUrl.trim(),
      };
    }

    if (Array.isArray(dto.documentUrls)) {
      patch.metadata = {
        ...(patch.metadata as Record<string, unknown>),
        documentUrls: dto.documentUrls,
      };
    }

    return this.contentService.update(id, patch as any);
  }

  @Delete('contents/:id')
  @ApiOperation({ summary: 'Xóa tài liệu học tập' })
  removeContent(@Param('id') id: string) {
    return this.contentService.remove(id);
  }
}
