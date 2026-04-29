import { Body, Controller, HttpCode, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { BatchMailService } from '../services/batch-mail.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/current-user.decorator';
import { RoleName } from '../../../common/constants/roles.enum';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { SendBatchMailDto, SendDirectMailDto } from '../dto/recruitment-mail.dto';
import { DataSource } from 'typeorm';

@ApiTags('Recruitment - Emails')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.HR)
@UsePipes(
  new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true, skipMissingProperties: true }),
)
@Controller('recruitment/mail')
export class RecruitmentMailController {
  constructor(
    private readonly batchMailService: BatchMailService,
    private readonly dataSource: DataSource,
  ) {}

  @Post('batch')
  @HttpCode(200)
  @ApiOperation({ summary: 'Gửi email hàng loạt cho ứng viên (Mời phỏng vấn/Kết quả)' })
  @ApiBody({ type: SendBatchMailDto })
  async sendBatchEmail(@Body() dto: SendBatchMailDto) {
    return await this.batchMailService.sendBatchEmail(dto.templateCode, dto.recipients);
  }

  @Post('send')
  @HttpCode(200)
  @ApiOperation({ summary: 'Gửi email hàng loạt với nội dung đã render sẵn từ FE' })
  @ApiBody({ type: SendDirectMailDto })
  async sendDirectEmail(@Body() dto: SendDirectMailDto) {
    return await this.batchMailService.sendDirectBatchEmail(dto.subject, dto.recipients);
  }

  @Post('send-invite-transaction')
  @HttpCode(200)
  async sendInviteTransaction(@Body() dto: SendDirectMailDto) {
    return this.batchMailService.sendInviteWithTransaction(dto.subject, dto.recipients, this.dataSource);
  }
}
