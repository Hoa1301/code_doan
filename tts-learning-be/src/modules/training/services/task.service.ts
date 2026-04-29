import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../../common/services/base.service';
import { Task } from '../entities/task.entity';
import { TaskComment } from '../entities/task-comment.entity';
import { CreateTaskDto } from '../dto/task.dto';

import { TaskStatus } from '../../../common/constants/status.enum';

@Injectable()
export class TaskService extends BaseService<Task> {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskComment)
    private readonly commentRepository: Repository<TaskComment>,
  ) {
    super(taskRepository);
  }

  async findWithFilters(params: {
    q?: string;
    status?: TaskStatus;
    internId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: Task[]; totalRows: number; page: number; pageSize: number }> {
    const page = Number.isFinite(params.page) && (params.page as number) > 0 ? (params.page as number) : 1;
    const pageSize =
      Number.isFinite(params.pageSize) && (params.pageSize as number) > 0 ? Math.min(params.pageSize as number, 100) : 10;

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.intern', 'intern')
      .leftJoinAndSelect('intern.user', 'internUser')
      .leftJoinAndSelect('task.mentor', 'mentor')
      .orderBy('task.createdAt', 'DESC');

    if (params.status) {
      queryBuilder.andWhere('task.status = :status', { status: params.status });
    }

    if (params.internId) {
      queryBuilder.andWhere('task.internId = :internId', { internId: params.internId });
    }

    const keyword = params.q?.trim();
    if (keyword) {
      queryBuilder.andWhere('(task.title ILIKE :keyword OR task.description ILIKE :keyword)', {
        keyword: `%${keyword}%`,
      });
    }

    queryBuilder.skip((page - 1) * pageSize).take(pageSize);
    const [data, totalRows] = await queryBuilder.getManyAndCount();

    return { data, totalRows, page, pageSize };
  }

  async create(data: CreateTaskDto): Promise<Task> {
    const count = await this.taskRepository.count();
    const code = `TSK-${(count + 1).toString().padStart(3, '0')}`;
    const payload: Partial<Task> = {
      ...data,
      code,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      attachments: Array.isArray(data.attachments) ? data.attachments : [],
    };
    return super.create(payload);
  }

  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    const task = await this.findOne(id);
    task.status = status;
    return await this.taskRepository.save(task);
  }

  async addComment(taskId: string, userId: string, commentText: string, attachments?: string[]): Promise<TaskComment> {
    const comment = this.commentRepository.create({
      taskId: taskId,
      userId: userId,
      comment: commentText,
      attachments: Array.isArray(attachments) ? attachments : [],
    });
    return await this.commentRepository.save(comment);
  }

  async getComments(taskId: string): Promise<TaskComment[]> {
    return await this.commentRepository.find({
      where: { taskId: taskId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }
}
