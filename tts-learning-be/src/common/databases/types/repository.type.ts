/* eslint-disable @typescript-eslint/no-redundant-type-constituents */

export interface IBaseFindOptions {
  sort?: Record<string, 'asc' | 'desc' | 1 | -1> | any;
  limit?: number;
  skip?: number;
  populate?: string[] | any;
  select?: string[] | any;
  search?: string;
  searchFields?: string[];
  ranges?: Record<string, { min?: any; max?: any }>;
  session?: any; // To support session passing
  [key: string]: any; // Allow other properties
}

export interface IBasePaginateOptions extends IBaseFindOptions {
  page?: number;
}

export interface IPaginatedResult<T> {
  hits: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}
