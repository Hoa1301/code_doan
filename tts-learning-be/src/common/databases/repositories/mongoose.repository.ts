import { Logger } from '@nestjs/common';
import { Model, FilterQuery, ClientSession, PopulateOptions } from 'mongoose';
import { AbstractBaseSchema } from '../../../providers/abstract-base/abstract-base.entity';
import { IBaseRepository } from '../interfaces/base.repository.interface';
import { IBaseFindOptions, IBasePaginateOptions, IPaginatedResult } from '../types/repository.type';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */

/* eslint-disable @typescript-eslint/require-await */
export class MongooseBaseRepository<T extends AbstractBaseSchema> implements IBaseRepository<T> {
  protected readonly logger = new Logger(MongooseBaseRepository.name);

  constructor(protected readonly model: Model<T>) {}

  async createRecord(dto: Partial<T> | any, options?: any): Promise<T> {
    const session: ClientSession | undefined = options?.session;
    this.logger.log(`[createRecord] START`, { dto });
    const [record] = await this.model.create([dto], { session });
    this.logger.log(`[createRecord] END`, { record });
    return record;
  }

  protected parseOptions(options?: IBasePaginateOptions) {
    return {
      populate: options?.populate || [],
      sort: options?.sort || { createdAt: -1 },
      limit: options?.limit || 10,
      skip: options?.skip || 0,
      lean: true,
      session: null, // Mongoose session handling needs to be passed explicitly if needed
      search: options?.search,
      searchFields: options?.searchFields || [],
      ranges: options?.ranges,
      ...options,
    };
  }

  protected buildQuery(
    filter: FilterQuery<T>,
    search?: string,
    searchFields?: string[],
    ranges?: Record<string, { min?: any; max?: any }>,
  ): FilterQuery<T> {
    const query: FilterQuery<T> = { ...filter, isDeleted: false };

    if (search && searchFields?.length) {
      const searchConditions = searchFields.map((field) => ({
        [field]: { $regex: search, $options: 'i' },
      }));
      if (searchConditions.length > 0) {
        Object.assign(query, { $or: searchConditions });
      }
    }

    if (ranges) {
      Object.entries(ranges).forEach(([field, range]) => {
        const rangeCondition: any = {};
        if (range.min !== undefined) rangeCondition.$gte = range.min;
        if (range.max !== undefined) rangeCondition.$lte = range.max;

        if (Object.keys(rangeCondition).length > 0) {
          Object.assign(query, { [field]: rangeCondition });
        }
      });
    }

    return query;
  }

  async getRecord(filter: FilterQuery<T> = {}, options?: IBaseFindOptions): Promise<T | null> {
    const finalOptions = this.parseOptions(options);
    const { populate, sort, lean, session, search, searchFields, ranges } = finalOptions;

    const queryCondition = this.buildQuery(filter, search, searchFields, ranges);

    return this.model
      .findOne(queryCondition)
      .populate(populate as PopulateOptions | string[])
      .sort(sort)
      .lean(lean)
      .session(session as ClientSession) as unknown as T | null;
  }

  async getRecords(filter: FilterQuery<T> = {}, options?: IBaseFindOptions): Promise<T[]> {
    const finalOptions = this.parseOptions(options);
    const { populate, sort, limit, skip, lean, session, search, searchFields, ranges } = finalOptions;

    const queryCondition = this.buildQuery(filter, search, searchFields, ranges);

    return this.model
      .find(queryCondition)
      .populate(populate as PopulateOptions | string[])
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .lean(lean)
      .session(session as ClientSession) as unknown as T[];
  }

  async getRecordsWithPagination(
    filter: FilterQuery<T> = {},
    options?: IBasePaginateOptions,
  ): Promise<IPaginatedResult<T>> {
    const finalOptions = this.parseOptions(options);
    const page = options?.page || 1;
    const { limit, sort, populate, lean, session, search, searchFields, ranges } = finalOptions;

    this.logger.log(`[getRecordsWithPagination] START`, { filter, options });

    const queryCondition = this.buildQuery(filter, search, searchFields, ranges);

    const [records, total] = await Promise.all([
      this.model
        .find(queryCondition)
        .populate(populate as PopulateOptions | string[])
        .sort(sort)
        .limit(limit)
        .skip((page - 1) * limit)
        .lean(lean)
        .session(session as ClientSession),
      this.model.countDocuments(queryCondition),
    ]);

    this.logger.log(`[getRecordsWithPagination] END`, { records, total });

    return {
      hits: records as T[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    };
  }

  async updateRecord(filter: FilterQuery<T>, dto: Partial<T> | any, options?: IBaseFindOptions): Promise<T | null> {
    this.logger.log(`[updateRecord] START`, { filter, dto, options });
    const finalOptions = this.parseOptions(options);
    const { lean, session } = finalOptions;

    const updateData = { ...dto, updatedAt: Date.now() };

    const record = await this.model.findOneAndUpdate({ ...filter, isDeleted: false }, updateData, {
      new: true,
      lean,
      session: session as ClientSession,
      upsert: true, // This behavior might differ in SQL, careful
    });

    this.logger.log(`[updateRecord] END`, { record });

    return record;
  }

  async deleteRecord(filter: FilterQuery<T>, options?: IBaseFindOptions): Promise<boolean> {
    this.logger.log(`[deleteRecord] START`, { filter, options });
    const finalOptions = this.parseOptions(options);
    const { lean, session } = finalOptions;

    const record = await this.model.findOneAndUpdate(
      { ...filter, isDeleted: false },
      { isDeleted: true, updatedAt: Date.now() },
      {
        new: true,
        lean,
        session: session as ClientSession,
      },
    );

    this.logger.log(`[deleteRecord] END`, { record });

    return !!record;
  }

  async deleteRecords(filter: FilterQuery<T>, options?: IBaseFindOptions): Promise<boolean> {
    this.logger.log(`[deleteRecords] START`, { filter, options });
    // This is a soft delete
    const records = await this.model.updateMany(
      { ...filter, isDeleted: false },
      { isDeleted: true, updatedAt: Date.now() },
    );

    this.logger.log(`[deleteRecords] END`, { records });

    return records.modifiedCount > 0;
  }
}
