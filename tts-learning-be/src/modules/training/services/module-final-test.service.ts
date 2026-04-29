import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageService } from '@/common/storage/storage.service';
import { Module as TrainingModule } from '../entities/module.entity';
import { ModuleFinalTest } from '../entities/module-final-test.entity';
import { ModuleFinalTestSubmission } from '../entities/module-final-test-submission.entity';
import { SubmitModuleFinalTestDto, UpsertModuleFinalTestDto } from '../dto/module-final-test.dto';

type FileResource = {
  fileName: string;
  originalName: string | null;
  url: string | null;
};

@Injectable()
export class ModuleFinalTestService {
  constructor(
    @InjectRepository(TrainingModule)
    private readonly moduleRepository: Repository<TrainingModule>,
    @InjectRepository(ModuleFinalTest)
    private readonly finalTestRepository: Repository<ModuleFinalTest>,
    @InjectRepository(ModuleFinalTestSubmission)
    private readonly submissionRepository: Repository<ModuleFinalTestSubmission>,
    private readonly storageService: StorageService,
  ) {}

  async getByModule(moduleId: string, internId?: string) {
    await this.ensureModuleExists(moduleId);

    const finalTest = await this.finalTestRepository.findOne({
      where: { moduleId },
    });
    const submission = internId
      ? await this.submissionRepository.findOne({
          where: { moduleId, internId },
        })
      : null;

    return {
      moduleId,
      finalTest: await this.toFinalTestResponse(finalTest),
      submission: await this.toSubmissionResponse(submission),
    };
  }

  async upsertByModule(moduleId: string, dto: UpsertModuleFinalTestDto) {
    await this.ensureModuleExists(moduleId);

    const record =
      (await this.finalTestRepository.findOne({
        where: { moduleId },
      })) || this.finalTestRepository.create({ moduleId });

    Object.assign(record, {
      materialFileName:
        dto.materialFileName !== undefined ? this.normalizeText(dto.materialFileName) : record.materialFileName ?? null,
      materialOriginalName:
        dto.materialOriginalName !== undefined
          ? this.normalizeText(dto.materialOriginalName)
          : record.materialOriginalName ?? null,
      materialLink: dto.materialLink !== undefined ? this.normalizeText(dto.materialLink) : record.materialLink ?? null,
      description: dto.description !== undefined ? this.normalizeText(dto.description) : record.description ?? null,
    });

    const saved = await this.finalTestRepository.save(record);
    return this.toFinalTestResponse(saved);
  }

  async upsertSubmission(moduleId: string, internId: string, dto: SubmitModuleFinalTestDto) {
    const finalTest = await this.finalTestRepository.findOne({
      where: { moduleId },
    });

    if (!finalTest) {
      throw new BadRequestException('Học phần này chưa có bài kiểm tra cuối học phần');
    }

    const record =
      (await this.submissionRepository.findOne({
        where: { moduleId, internId },
      })) ||
      this.submissionRepository.create({
        moduleId,
        internId,
      });

    Object.assign(record, {
      finalTestId: finalTest.id,
      submissionFileName:
        dto.submissionFileName !== undefined
          ? this.normalizeText(dto.submissionFileName)
          : record.submissionFileName ?? null,
      submissionOriginalName:
        dto.submissionOriginalName !== undefined
          ? this.normalizeText(dto.submissionOriginalName)
          : record.submissionOriginalName ?? null,
      submissionLink:
        dto.submissionLink !== undefined ? this.normalizeText(dto.submissionLink) : record.submissionLink ?? null,
      description: dto.description !== undefined ? this.normalizeText(dto.description) : record.description ?? null,
      submittedAt: new Date(),
      status: 'submitted',
    });

    const saved = await this.submissionRepository.save(record);
    return this.toSubmissionResponse(saved);
  }

  private async ensureModuleExists(moduleId: string): Promise<void> {
    const moduleExists = await this.moduleRepository.exists({
      where: { id: moduleId },
    });

    if (!moduleExists) {
      throw new NotFoundException('Không tìm thấy học phần');
    }
  }

  private normalizeText(value?: string): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }

  private async buildFileResource(fileName?: string | null, originalName?: string | null): Promise<FileResource | null> {
    if (!fileName) {
      return null;
    }

    let url: string | null = null;

    try {
      url = await this.storageService.getFileUrl(fileName);
    } catch {
      url = null;
    }

    return {
      fileName,
      originalName: originalName || null,
      url,
    };
  }

  private async toFinalTestResponse(record: ModuleFinalTest | null) {
    if (!record) {
      return null;
    }

    return {
      id: record.id,
      moduleId: record.moduleId,
      description: record.description,
      materialLink: record.materialLink,
      materialFile: await this.buildFileResource(record.materialFileName, record.materialOriginalName),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private async toSubmissionResponse(record: ModuleFinalTestSubmission | null) {
    if (!record) {
      return null;
    }

    return {
      id: record.id,
      moduleId: record.moduleId,
      internId: record.internId,
      description: record.description,
      submissionLink: record.submissionLink,
      submittedAt: record.submittedAt,
      status: record.status,
      submissionFile: await this.buildFileResource(record.submissionFileName, record.submissionOriginalName),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
