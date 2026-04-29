/* eslint-disable @typescript-eslint/no-redundant-type-constituents */

import { IBaseFindOptions, IBasePaginateOptions, IPaginatedResult } from '../types/repository.type';

export interface IBaseRepository<T> {
  createRecord(dto: Partial<T> | any, options?: any): Promise<T>;

  getRecord(filter: any, options?: IBaseFindOptions): Promise<T | null>;

  getRecords(filter: any, options?: IBaseFindOptions): Promise<T[]>;

  getRecordsWithPagination(filter: any, options?: IBasePaginateOptions): Promise<IPaginatedResult<T>>;

  updateRecord(filter: any, dto: Partial<T> | any, options?: IBaseFindOptions): Promise<T | null>;

  deleteRecord(filter: any, options?: IBaseFindOptions): Promise<boolean>;

  deleteRecords(filter: any, options?: IBaseFindOptions): Promise<boolean>;
}
