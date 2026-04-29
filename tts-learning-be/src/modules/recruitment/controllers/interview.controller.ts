import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InterviewService } from '../services/interview.service';
import { CreateInterviewDto, UpdateInterviewDto, CreateBatchInterviewDto } from '../dto/interview.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { InterviewStatus } from '@/common/constants/status.enum';
import { Res } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '@/common/decorators/public.decorator';
@ApiTags('Recruitment - Interviews')
@Controller('interviews')
export class InterviewController {
  constructor(private readonly service: InterviewService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Lên lịch phỏng vấn mới' })
  create(@Body() dto: CreateInterviewDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('batch')
  @ApiOperation({ summary: 'Tạo hàng loạt lịch phỏng vấn với tự động chia giờ' })
  createBatch(@Body() dto: CreateBatchInterviewDto) {
    return this.service.createBatch(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách các buổi phỏng vấn' })
  async findAll(@Query() query: any) {
    const data = await this.service.findAll({
      where: query,
      relations: ['candidate', 'job', 'interviewer'],
    });
    return {
      hits: data.map((interview) => ({
        ...interview,
        candidateName: interview.candidate?.fullName || 'N/A',
        jobTitle: interview.job?.title || 'N/A',
        interviewerName: interview.interviewer?.fullName || 'N/A',
        // Map fields that UI might expect if they differ
      })),
      pagination: {
        totalRows: data.length,
        totalPages: 1,
      },
    };
  }

  @Public()
  @Get('confirm')
  async confirmInterview(@Query('token') token: string, @Res() res: Response) {
    const result = await this.service.handleTokenAction(token, InterviewStatus.COMPLETED);
    const message = result.success ? 'Xác nhận tham gia phỏng vấn thành công' : result.message;
    return res.send(`
        <html>
          <body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif">
            <div style="text-align:center">
              <h2>${message}</h2>
              <p>Tab sẽ tự đóng trong vài giây...</p>
            </div>

            <script>
              setTimeout(() => {
                window.open('', '_self');
                window.close();
              }, 5000);
            </script>
          </body>
        </html>
        `);
  }

  @Public()
  @Get('reject')
  async rejectInterview(@Query('token') token: string, @Res() res: Response) {
    const result = await this.service.handleTokenAction(token, InterviewStatus.CANCELLED);
    const message = result.success ? 'Từ chối tham gia phỏng vấn thành công' : result.message;

    return res.send(`
    <html>
      <body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif">
        <div style="text-align:center">
          <h2>${message}</h2>
          <p>Tab sẽ tự đóng trong vài giây...</p>
        </div>

        <script>
          setTimeout(() => {
            window.open('', '_self');
            window.close();
          }, 5000);
        </script>
      </body>
    </html>
    `);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết buổi phỏng vấn' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id, { relations: ['candidate', 'job', 'interviewer'] });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật kết quả phỏng vấn' })
  update(@Param('id') id: string, @Body() dto: UpdateInterviewDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Hủy buổi phỏng vấn' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/generate-token')
  @UseGuards(JwtAuthGuard)
  async generateToken(@Param('id') id: string) {
    return this.service.generateActionToken(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: InterviewStatus }) {
    return this.service.updateStatus(id, body.status);
  }
}
