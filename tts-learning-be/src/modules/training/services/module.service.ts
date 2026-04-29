import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../../common/services/base.service';
import { Module } from '../entities/module.entity';
import { ReorderModulesDto } from '../dto/module.dto';

@Injectable()
export class TrainingModuleService extends BaseService<Module> {
  constructor(
    @InjectRepository(Module)
    private readonly moduleRepository: Repository<Module>,
  ) {
    super(moduleRepository);
  }

  async findByLearningPath(learningPathId: string): Promise<Module[]> {
    return this.moduleRepository.find({
      where: { learningPathId },
      relations: ['contents', 'quizzes'],
      order: { orderIndex: 'ASC', createdAt: 'ASC' },
    });
  }

  async reorder(learningPathId: string, dto: ReorderModulesDto): Promise<Module[]> {
    const uniqueIds = new Set(dto.modules.map((item) => item.id));
    if (uniqueIds.size !== dto.modules.length) {
      throw new BadRequestException('Danh sách học phần sắp xếp bị trùng ID');
    }

    const moduleIds = dto.modules.map((item) => item.id);
    const records = await this.moduleRepository.find({ where: { learningPathId } });
    const existingIds = new Set(records.map((item) => item.id));

    for (const moduleId of moduleIds) {
      if (!existingIds.has(moduleId)) {
        throw new BadRequestException('Có học phần không thuộc lộ trình này');
      }
    }

    const indexById = new Map(dto.modules.map((item) => [item.id, item.orderIndex]));

    for (const record of records) {
      if (moduleIds.includes(record.id)) {
        record.orderIndex = indexById.get(record.id) ?? record.orderIndex;
      }
    }

    await this.moduleRepository.save(records);
    return this.findByLearningPath(learningPathId);
  }
}
