import { Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { IBaseRepository } from '../../common/databases/interfaces/base.repository.interface';
import { IBaseFindOptions, IBasePaginateOptions } from '../../common/databases/types/repository.type';
import { MongooseBaseRepository } from '../../common/databases/repositories/mongoose.repository';

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
export abstract class AbstractBaseService<T> {
  protected readonly logger = new Logger(AbstractBaseService.name);
  protected readonly repository: IBaseRepository<T>;

  constructor(repositoryOrModel: IBaseRepository<T> | Model<T>) {
    if (this.isModel(repositoryOrModel)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.repository = new MongooseBaseRepository(repositoryOrModel as any) as unknown as IBaseRepository<T>;
    } else {
      this.repository = repositoryOrModel;
    }
  }

  private isModel(obj: any): obj is Model<T> {
    return obj && typeof obj.find === 'function' && typeof obj.create === 'function';
  }

  async createRecord(dto: Partial<T> | any, options?: any) {
    if (options && typeof options.startTransaction === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return this.repository.createRecord(dto, { session: options });
    }
    return this.repository.createRecord(dto, options);
  }

  async getRecord(filter: any = {}, options?: IBaseFindOptions) {
    return this.repository.getRecord(filter, options);
  }

  async getRecords(filter: any = {}, options?: IBaseFindOptions) {
    return this.repository.getRecords(filter, options);
  }

  async getRecordsWithPagination(filter: any = {}, options?: IBasePaginateOptions) {
    return this.repository.getRecordsWithPagination(filter, options);
  }

  async updateRecord(filter: any, dto: Partial<T> | any, options?: IBaseFindOptions) {
    return this.repository.updateRecord(filter, dto, options);
  }

  async deleteRecord(filter: any, options?: IBaseFindOptions) {
    return this.repository.deleteRecord(filter, options);
  }

  async deleteRecords(filter: any, options?: IBaseFindOptions) {
    return this.repository.deleteRecords(filter, options);
  }
}
