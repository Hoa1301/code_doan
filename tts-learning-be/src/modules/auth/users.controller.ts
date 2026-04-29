import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, BadRequestException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('System - Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mới người dùng' })
  create(@Body() dto: CreateUserDto & { name?: string }) {
    return this.service.create({
      ...dto,
      fullName: dto.fullName || dto.name,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả người dùng' })
  async findAll() {
    const data = await this.service.findAll();
    return {
      hits: data.map((user) => ({
        ...user,
        key: user.id, // UI uses 'key'
        name: user.fullName,
        role: user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'User',
        status: user.status === 'active' ? 'Active' : 'Inactive',
        lastLogin: '2024-03-16 08:00', // Mock for UI
      })),
      pagination: {
        totalRows: data.length,
        totalPages: 1,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một người dùng' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa người dùng' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload avatar user' })
  async uploadAvatar(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const fileName = `avatars/${Date.now()}-${file.originalname}`;

    await this.service['storageService'].uploadFile(fileName, file.buffer, file.mimetype);

    await this.service.update(id, {
      avatarUrl: fileName,
    });

    return {
      avatarUrl: await this.service['storageService'].getFileUrl(fileName),
    };
  }
}
