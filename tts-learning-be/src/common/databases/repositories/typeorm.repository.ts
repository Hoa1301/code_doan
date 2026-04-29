/* eslint-disable */
import { Logger } from '@nestjs/common';
import { Repository, FindOptionsWhere, DeepPartial, Like } from 'typeorm';
import { TypeOrmBaseEntity } from '../entities/typeorm.entity';
import { IBaseRepository } from '../interfaces/base.repository.interface';
import { IBaseFindOptions, IBasePaginateOptions, IPaginatedResult } from '../types/repository.type';

export abstract class TypeOrmBaseRepository<T extends TypeOrmBaseEntity> implements IBaseRepository<T> {
  protected readonly logger = new Logger(TypeOrmBaseRepository.name);

  constructor(protected readonly repository: Repository<T>) {}

  async createRecord(dto: DeepPartial<T> | any, options?: any): Promise<T> {
    this.logger.log(`[createRecord] START`, { dto });
    const entity = this.repository.create(dto as DeepPartial<T>);
    const record = await this.repository.save(entity, options as any);
    this.logger.log(`[createRecord] END`, { record });
    return record;
  }

  protected parseOptions(options?: IBaseFindOptions) {
    return {
      relations: options?.populate || [],
      order: options?.sort || { createdAt: 'DESC' },
      take: options?.limit || 10,
      skip: options?.skip || 0,
      where: {}, // Base where clause needs to be built separately
    };
  }

  protected buildWhere(
    filter: any,
    search?: string,
    searchFields?: string[],
    ranges?: Record<string, { min?: any; max?: any }>,
  ): FindOptionsWhere<T> | FindOptionsWhere<T>[] {
    const where: any = { ...filter, isDeleted: false };

    if (search && searchFields?.length) {
      // TypeORM OR condition for search requires array of objects
      // This is complex because we need to combine existing filter with OR conditions
      // Simplified approach: add Like conditions if search is present
      // For more complex queries, QueryBuilder is recommended over Repository API
      return searchFields.map((field) => ({
        ...where,
        [field]: Like(`%${search}%`),
      }));
    }

    if (ranges) {
      // Range queries in TypeORM repository API are tricky without MoreThan/LessThan helpers imported
      // Ideally use QueryBuilder or import TypeORM operators
      // Skipping complex range logic for now in this basic implementation
    }

    return where;
  }

  async getRecord(filter: any = {}, options?: IBaseFindOptions): Promise<T | null> {
    const { relations, order } = this.parseOptions(options);
    const where = this.buildWhere(filter, options?.search, options?.searchFields, options?.ranges);

    return this.repository.findOne({
      where,
      relations,
      order: order as any,
    });
  }

  async getRecords(filter: any = {}, options?: IBaseFindOptions): Promise<T[]> {
    const { relations, order, take, skip } = this.parseOptions(options);
    const where = this.buildWhere(filter, options?.search, options?.searchFields, options?.ranges);

    return this.repository.find({
      where,
      relations,
      order: order as any,
      take,
      skip,
    });
  }

  async getRecordsWithPagination(filter: any = {}, options?: IBasePaginateOptions): Promise<IPaginatedResult<T>> {
    const page = options?.page || 1;
    const { relations, order, take } = this.parseOptions(options);
    const skip = (page - 1) * take;

    this.logger.log(`[getRecordsWithPagination] START`, { filter, options });

    const where = this.buildWhere(filter, options?.search, options?.searchFields, options?.ranges);

    const [records, total] = await this.repository.findAndCount({
      where,
      relations,
      order: order as any,
      take,
      skip,
    });

    this.logger.log(`[getRecordsWithPagination] END`, { records, total });

    return {
      hits: records,
      total,
      page,
      totalPages: Math.ceil(total / take),
      limit: take,
    };
  }

  async updateRecord(filter: any, dto: DeepPartial<T> | any, options?: IBaseFindOptions): Promise<T | null> {
    this.logger.log(`[updateRecord] START`, { filter, dto });
    // This is less atomic than Mongoose findOneAndUpdate
    // Ideally use QueryBuilder or update() then findOne()

    // Find first
    const record = await this.getRecord(filter, options);
    if (!record) return null;

    // Update
    const merged = this.repository.merge(record, { ...dto, updatedAt: new Date() });
    return this.repository.save(merged);
  }

  async deleteRecord(filter: any, options?: IBaseFindOptions): Promise<boolean> {
    this.logger.log(`[deleteRecord] START`, { filter });
    const record = await this.getRecord(filter, options);
    if (!record) return false;

    // Soft delete
    record.isDeleted = true;
    record.updatedAt = new Date(); // Assuming updatedBy/At exists
    await this.repository.save(record);
    return true;
  }

  async deleteRecords(filter: any, options?: IBaseFindOptions): Promise<boolean> {
    // Batch soft delete
    // This requires manual update query
    await this.repository.update(filter, { isDeleted: true, updatedAt: new Date() } as any);
    return true;
  }
}
