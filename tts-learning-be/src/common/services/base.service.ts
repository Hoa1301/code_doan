import { NotFoundException } from '@nestjs/common';
import { Repository, DeepPartial, FindOneOptions, FindManyOptions } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';

export abstract class BaseService<T extends BaseEntity> {
  constructor(protected readonly repository: Repository<T>) {}

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    const finalOptions: FindManyOptions<T> = {
      order: { createdAt: 'DESC' } as any,
      ...options,
    };
    return await this.repository.find(finalOptions);
  }

  async findOne(id: any, options?: FindOneOptions<T>): Promise<T> {
    const record = await this.repository.findOne({
      where: { id } as any,
      ...options,
    });
    if (!record) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }
    return record;
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  async update(id: any, data: DeepPartial<T>): Promise<T> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return await this.repository.save(entity);
  }

  async remove(id: any): Promise<void> {
    const entity = await this.findOne(id);
    await this.repository.softRemove(entity);
  }
}
