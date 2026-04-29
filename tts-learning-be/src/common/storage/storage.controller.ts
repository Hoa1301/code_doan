import { Controller, Post, Get, Param, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('System - Storage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Tải file lên hệ thống (MinIO)' })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const fileName = `${Date.now()}-${file.originalname}`;
    await this.storageService.uploadFile(fileName, file.buffer, file.mimetype);
    return { fileName };
  }

  @Get('url/:fileName')
  @ApiOperation({ summary: 'Lấy URL xem file (có thời hạn 24h)' })
  async getFileUrl(@Param('fileName') fileName: string) {
    const url = await this.storageService.getFileUrl(fileName);
    return { url };
  }
}
