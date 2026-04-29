import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SystemSettingService } from '../services/system-setting.service';
import { CreateSystemSettingDto, UpdateSystemSettingDto } from '../dto/system-setting.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('System - Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('system-settings')
export class SystemSettingController {
  constructor(private readonly service: SystemSettingService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo cấu hình hệ thống mới' })
  create(@Body() dto: CreateSystemSettingDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả cấu hình hệ thống' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':key')
  @ApiOperation({ summary: 'Lấy cấu hình theo Key' })
  findOne(@Param('key') key: string) {
    return this.service.findAll({ where: { key } as any });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật cấu hình' })
  update(@Param('id') id: string, @Body() dto: UpdateSystemSettingDto) {
    return this.service.update(id, dto);
  }
}
