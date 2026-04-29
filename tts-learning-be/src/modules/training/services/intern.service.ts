import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { BaseService } from '../../../common/services/base.service';
import { Intern } from '../entities/intern.entity';
import { InternProgress } from '../entities/intern-progress.entity';
import { CreateInternDto, MentorUpdateInternDto } from '../dto/intern.dto';
import { LearningPath } from '../entities/learning-path.entity';
import { Module as TrainingModule } from '../entities/module.entity';
import { UpdateInternDto } from '../dto/intern.dto';

type MentorManagedInternUpdate = Pick<UpdateInternDto, 'learningPathId' | 'startDate' | 'endDate' | 'status'>;

@Injectable()
export class InternService extends BaseService<Intern> {
  constructor(
    @InjectRepository(Intern)
    private readonly internRepository: Repository<Intern>,
    @InjectRepository(InternProgress)
    private readonly progressRepository: Repository<InternProgress>,
    @InjectRepository(LearningPath)
    private readonly learningPathRepository: Repository<LearningPath>,
    @InjectRepository(TrainingModule)
    private readonly moduleRepository: Repository<TrainingModule>,
  ) {
    super(internRepository);
  }

  private normalizeDateValue(value?: string | Date | null): string | undefined {
    if (!value) {
      return undefined;
    }

    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }

    return String(value).slice(0, 10);
  }

  private validateInternshipPeriod(startDate?: string, endDate?: string): void {
    if (!startDate || !endDate) {
      return;
    }

    if (new Date(startDate).getTime() > new Date(endDate).getTime()) {
      throw new BadRequestException('Internship start date must be before or equal to end date');
    }
  }

  private async resolveTrack(learningPathId?: string, track?: string | null): Promise<string | null> {
    if (learningPathId) {
      const learningPath = await this.learningPathRepository.findOne({ where: { id: learningPathId } });
      if (!learningPath) {
        throw new BadRequestException('Learning path không tồn tại');
      }
      return learningPath.track;
    }

    if (!track || !track.trim()) {
      return null;
    }

    return track;
  }

  private async syncInternProgress(internId: string, learningPathId: string): Promise<void> {
    const firstModule = await this.moduleRepository.findOne({
      where: { learningPathId },
      order: { orderIndex: 'ASC', createdAt: 'ASC' },
    });

    const existing = await this.progressRepository.findOne({ where: { internId, learningPathId } });
    if (existing) {
      existing.currentModuleId = firstModule?.id || existing.currentModuleId;
      existing.overallProgress = existing.overallProgress || 0;
      existing.modulesCompleted = existing.modulesCompleted || [];
      await this.progressRepository.save(existing);
      return;
    }

    const progress = this.progressRepository.create({
      internId,
      learningPathId,
      currentModuleId: firstModule?.id,
      modulesCompleted: [],
      overallProgress: 0,
    });

    await this.progressRepository.save(progress);
  }

  async getProgress(internId: string): Promise<InternProgress | null> {
    return await this.progressRepository.findOne({
      where: { internId },
      relations: ['learningPath', 'currentModule'],
    });
  }

  async create(data: CreateInternDto): Promise<Intern> {
    const count = await this.internRepository.count();
    const code = `ITS-${(count + 1).toString().padStart(3, '0')}`;
    const track = await this.resolveTrack(data.learningPathId, data.track);
    const intern = await super.create({ ...data, track, code } as any);

    if (data.learningPathId) {
      await this.syncInternProgress(intern.id, data.learningPathId);
    }

    return intern;
  }

  async update(id: string, data: UpdateInternDto): Promise<Intern> {
    const patch: UpdateInternDto = { ...data };

    if (data.learningPathId || data.track) {
      patch.track = await this.resolveTrack(data.learningPathId, data.track);
    }

    const intern = await super.update(id, patch as any);

    if (data.learningPathId) {
      await this.syncInternProgress(id, data.learningPathId);
    }

    return intern;
  }

  async findOneForMentor(id: string, mentorUserId: string, options?: FindOneOptions<Intern>): Promise<Intern> {
    const intern = await this.internRepository.findOne({
      ...options,
      where: [{ id, mentorId: mentorUserId }, { code: id, mentorId: mentorUserId }] as any,
    });

    if (intern) {
      return intern;
    }

    const existingIntern = await this.internRepository.findOne({
      where: [{ id }, { code: id }] as any,
    });

    if (existingIntern) {
      throw new ForbiddenException('You do not have permission to manage this intern');
    }

    throw new NotFoundException(`Resource with ID ${id} not found`);
  }

  async updateMentorManagedFields(id: string, mentorUserId: string, data: MentorUpdateInternDto): Promise<Intern> {
    const patch: MentorManagedInternUpdate = {};

    if (data.learningPathId !== undefined) {
      patch.learningPathId = data.learningPathId;
    }

    if (data.status !== undefined) {
      patch.status = data.status;
    }

    if (data.startDate !== undefined) {
      patch.startDate = data.startDate;
    }

    if (data.endDate !== undefined) {
      patch.endDate = data.endDate;
    }

    if (!Object.keys(patch).length) {
      throw new BadRequestException('No mentor-managed fields provided');
    }

    const currentIntern = await this.findOneForMentor(id, mentorUserId);
    const startDate = patch.startDate ?? this.normalizeDateValue(currentIntern.startDate);
    const endDate = patch.endDate ?? this.normalizeDateValue(currentIntern.endDate);

    this.validateInternshipPeriod(startDate, endDate);

    return this.update(currentIntern.id, patch);
  }

  async findByCandidateId(candidateId: string): Promise<Intern | null> {
    return await this.internRepository.findOne({ where: { candidateId } });
  }

  async findByUserId(userId: string): Promise<Intern> {
    const intern = await this.internRepository.findOne({ where: { userId } });
    if (!intern) {
      throw new Error(`Không tìm thấy thực tập sinh với User ID: ${userId} đâu bạn ơi!`);
    }
    return intern;
  }
}
