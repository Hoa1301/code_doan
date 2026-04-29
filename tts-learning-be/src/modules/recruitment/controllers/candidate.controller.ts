import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Query,
  ParseFilePipeBuilder,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CandidateService } from '../services/candidate.service';
import { ConvertCandidateToInternDto, CreateCandidateDto, UpdateCandidateDto } from '../dto/candidate.dto';
import { StorageService } from '../../../common/storage/storage.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Candidate } from '../entities/candidate.entity';
import { extname } from 'path';

const CV_MAX_SIZE_IN_BYTES = 5 * 1024 * 1024;
const CV_ALLOWED_MIME_PATTERN =
  /^(application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/;
const REQUIRED_CV_FILE_PIPE = new ParseFilePipeBuilder()
  .addFileTypeValidator({ fileType: CV_ALLOWED_MIME_PATTERN })
  .addMaxSizeValidator({ maxSize: CV_MAX_SIZE_IN_BYTES })
  .build({
    fileIsRequired: true,
    errorHttpStatusCode: 422,
  });
const OPTIONAL_CV_FILE_PIPE = new ParseFilePipeBuilder()
  .addFileTypeValidator({ fileType: CV_ALLOWED_MIME_PATTERN })
  .addMaxSizeValidator({ maxSize: CV_MAX_SIZE_IN_BYTES })
  .build({
    fileIsRequired: false,
    errorHttpStatusCode: 422,
  });

@ApiTags('Recruitment - Candidates')
@Controller('candidates')
export class CandidateController {
  private readonly logger = new Logger(CandidateController.name);

  constructor(
    private readonly service: CandidateService,
    private readonly storageService: StorageService,
  ) {}

  private getExtensionFromMimeType(mimeType: string): string {
    if (mimeType === 'application/pdf') {
      return '.pdf';
    }

    if (mimeType === 'application/msword') {
      return '.doc';
    }

    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return '.docx';
    }

    throw new BadRequestException('Unsupported CV file type');
  }

  private buildCandidateCvFileName(file: Express.Multer.File): string {
    const currentExtension = extname(file.originalname || '').toLowerCase();
    const safeExtension = currentExtension || this.getExtensionFromMimeType(file.mimetype);
    const baseName = (file.originalname || 'cv').replace(/\.[^.]+$/, '');
    const normalizedBaseName = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
    const filePrefix = normalizedBaseName || 'cv';

    return `cvs/${Date.now()}-${filePrefix}${safeExtension}`;
  }

  private async mapCandidateResumeUrl(candidate: Candidate): Promise<Candidate> {
    if (!candidate.resumeUrl || candidate.resumeUrl.startsWith('http')) {
      return candidate;
    }

    const resumePublicUrl = await this.storageService.getFileUrl(candidate.resumeUrl);

    return {
      ...candidate,
      resumeUrl: resumePublicUrl,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Ứng tuyển vào vị trí (Public - Không có CV file)' })
  async create(@Body() dto: CreateCandidateDto) {
    const candidate = await this.service.create(dto);
    return this.mapCandidateResumeUrl(candidate);
  }

  @Post('upload-cv')
  @UseInterceptors(FileInterceptor('cv'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['cv'],
      properties: {
        cv: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload CV file và nhận thông tin file' })
  async uploadCv(@UploadedFile(REQUIRED_CV_FILE_PIPE) file: Express.Multer.File) {
    const fileName = this.buildCandidateCvFileName(file);
    await this.storageService.uploadFile(fileName, file.buffer, file.mimetype);

    return {
      fileName,
      fileUrl: await this.storageService.getFileUrl(fileName),
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  @Post('apply-with-cv')
  @UseInterceptors(FileInterceptor('cv'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        cv: { type: 'string', format: 'binary' },
        fullName: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        jobId: { type: 'string' },
        location: { type: 'string' },
        education: { type: 'string' },
        experience: { type: 'string' },
        coverLetter: { type: 'string' },
      },
    },
  })
  @ApiOperation({ summary: 'Ứng tuyển vào vị trí kèm upload CV (Public)' })
  async applyWithCv(
    @UploadedFile(OPTIONAL_CV_FILE_PIPE)
    file: Express.Multer.File,
    @Body() dto: CreateCandidateDto,
  ) {
    let resumeUrl: string | undefined;
    if (file) {
      const fileName = this.buildCandidateCvFileName(file);
      await this.storageService.uploadFile(fileName, file.buffer, file.mimetype);
      resumeUrl = fileName;
    }

    const candidate = await this.service.create({
      ...dto,
      resumeUrl,
    });

    return this.mapCandidateResumeUrl(candidate);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách ứng viên (Dành cho HR/Mentor)' })
  async findAll(@Query() query: any) {
    const status = typeof query.status === 'string' ? query.status.toLowerCase() : 'all';
    const statuses = status === 'all' ? [] : status === 'cv_dat' ? ['shortlisted', 'cv_screened'] : [status];
    const q = typeof query.q === 'string' ? query.q : undefined;
    const page = Number.parseInt(String(query.page || '1'), 10);
    const pageSize = Number.parseInt(String(query.pageSize || '10'), 10);
    const {
      data,
      totalRows,
      page: currentPage,
      pageSize: currentPageSize,
    } = await this.service.findWithFilters({
      q,
      statuses,
      page,
      pageSize,
      jobId: query.jobId,
      planId: query.planId,
      department: query.department,
      ids: query.ids
    });

    const totalPages = Math.max(1, Math.ceil(totalRows / currentPageSize));

    return {
      hits: data.map((can) => ({
        ...can,
        name: can.fullName,
        fullName: can.fullName,
        avatar: can.avatarUrl || `https://i.pravatar.cc/150?u=${can.id}`,
        appliedForTitle: can.job?.title || 'N/A',
        appliedDate: can.appliedDate ? new Date(can.appliedDate).toLocaleDateString('vi-VN') : 'N/A',
        timeAgo: 'Mới đây',
        matchScore: can.matchScore || Math.floor(Math.random() * 40) + 60,
        status: can.status,
      })),
      pagination: {
        page: currentPage,
        pageSize: currentPageSize,
        totalRows,
        totalPages,
      },
    };
  }

  // @Get('summary')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  // @ApiOperation({ summary: 'Lấy số lượng ứng viên theo từng trạng thái (dùng cho tab badge)' })
  // getSummary() {
  //   return this.service.getSummary();
  // }

  @Get('summary')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy số lượng ứng viên theo từng trạng thái (có filter job/plan)' })
  getSummary(@Query() query: any) {
    return this.service.getSummaryWithFilter({
      jobId: query.jobId,
      planId: query.planId,
    });
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy chi tiết hồ sơ ứng viên' })
  async findOne(@Param('id') id: string) {
    const candidate = await this.service.findOne(id, { relations: ['job', 'user', 'interviews'] });

    if (candidate.resumeUrl && !candidate.resumeUrl.startsWith('http')) {
      candidate.resumeUrl = await this.storageService.getFileUrl(candidate.resumeUrl);
    }

    return candidate;
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cập nhật trạng thái ứng viên' })
  update(@Param('id') id: string, @Body() dto: UpdateCandidateDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/cv')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('cv'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['cv'],
      properties: {
        cv: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Cập nhật file CV cho ứng viên' })
  async updateCandidateCv(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile(REQUIRED_CV_FILE_PIPE)
    file: Express.Multer.File,
  ) {
    const existingCandidate = await this.service.findOne(id);
    const oldResumeUrl = existingCandidate.resumeUrl;

    const fileName = this.buildCandidateCvFileName(file);
    await this.storageService.uploadFile(fileName, file.buffer, file.mimetype);

    const updatedCandidate = await this.service.updateResumeUrl(id, fileName);

    if (oldResumeUrl && !oldResumeUrl.startsWith('http') && oldResumeUrl !== fileName) {
      try {
        await this.storageService.deleteFile(oldResumeUrl);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.warn(`Failed to remove old CV file ${oldResumeUrl}: ${message}`);
      }
    }

    return this.mapCandidateResumeUrl(updatedCandidate);
  }

  @Post(':id/convert-to-intern')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Chuyển đổi ứng viên thành thực tập sinh chính thức' })
  convertToIntern(@Param('id') id: string, @Body() dto: ConvertCandidateToInternDto) {
    return this.service.convertToIntern(id, dto.mentorId, dto.learningPathId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Xóa hồ sơ ứng viên' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
