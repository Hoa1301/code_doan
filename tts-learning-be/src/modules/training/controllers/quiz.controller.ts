import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QuizService } from '../services/content.service';
import { InternService } from '../services/intern.service';
import { CreateQuizDto, UpdateQuizDto, SubmitQuizDto } from '../dto/content.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Training - Quizzes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('quizzes')
export class QuizController {
  constructor(
    private readonly service: QuizService,
    private readonly internService: InternService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tạo bài kiểm tra mới' })
  create(@Body() dto: CreateQuizDto) {
    return this.service.createWithQuestions(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách bài kiểm tra' })
  findAll() {
    return this.service.findAll({ relations: ['questions'] });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết bài kiểm tra' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id, { relations: ['questions'] });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật bài kiểm tra' })
  update(@Param('id') id: string, @Body() dto: UpdateQuizDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Nộp bài làm Quiz' })
  async submit(@Param('id') id: string, @Body('answers') answers: any, @CurrentUser() user: any) {
    const intern = await this.internService.findByUserId(user.id);
    return this.service.submitQuiz(intern.id, { quizId: id, answers });
  }
}
