import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TaskService } from '../services/task.service';
import { CreateTaskDto, UpdateTaskDto, CreateTaskCommentDto } from '../dto/task.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { TaskStatus } from '../../../common/constants/status.enum';

@ApiTags('Training - Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TaskController {
  constructor(private readonly service: TaskService) {}

  @Post()
  @ApiOperation({ summary: 'Giao nhiệm vụ mới cho thực tập sinh' })
  create(@Body() dto: CreateTaskDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách nhiệm vụ' })
  async findAll(@Query() query: any) {
    const status = typeof query.status === 'string' ? (query.status.toLowerCase() as TaskStatus) : undefined;
    const internId = typeof query.internId === 'string' ? query.internId : undefined;
    const q = typeof query.q === 'string' ? query.q : undefined;
    const page = Number.parseInt(String(query.page || '1'), 10);
    const pageSize = Number.parseInt(String(query.pageSize || '10'), 10);

    const { data, totalRows, page: currentPage, pageSize: currentPageSize } = await this.service.findWithFilters({
      q,
      status,
      internId,
      page,
      pageSize,
    });

    const totalPages = Math.max(1, Math.ceil(totalRows / currentPageSize));

    return {
      hits: data.map((task) => {
        const { intern, ...rest } = task;
        return {
          ...rest,
          internName: intern?.user?.fullName || 'N/A',
          internAvatar: `https://i.pravatar.cc/150?u=${task.internId}`,
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : null,
          status: task.status,
        };
      }),
      pagination: {
        page: currentPage,
        pageSize: currentPageSize,
        totalRows,
        totalPages,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết nhiệm vụ và thảo luận' })
  async findOne(@Param('id') id: string) {
    const task = await this.service.findOne(id, { relations: ['intern', 'mentor'] });
    const comments = await this.service.getComments(id);
    return { ...task, comments };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái nhiệm vụ (Intern/Mentor)' })
  updateStatus(@Param('id') id: string, @Body('status') status: TaskStatus) {
    return this.service.updateStatus(id, status);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin nhiệm vụ' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Thêm thảo luận mới vào nhiệm vụ' })
  addComment(@Param('id') id: string, @Body() dto: CreateTaskCommentDto, @CurrentUser() user: any) {
    return this.service.addComment(id, user.id, dto.content, dto.attachments);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa nhiệm vụ' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
