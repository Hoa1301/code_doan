import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../../common/services/base.service';
import { LearningPath } from '../entities/learning-path.entity';

@Injectable()
export class LearningPathService extends BaseService<LearningPath> {
  constructor(
    @InjectRepository(LearningPath)
    private readonly learningPathRepository: Repository<LearningPath>,
  ) {
    super(learningPathRepository);
  }

  async findByTrack(track: string): Promise<LearningPath | null> {
    return this.learningPathRepository.findOne({
      where: { track } as any,
      relations: ['modules', 'modules.contents', 'modules.quizzes'],
      order: {
        modules: {
          orderIndex: 'ASC',
          createdAt: 'ASC',
        },
      },
    });
  }
}
