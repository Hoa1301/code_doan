import { ClientSession, PopulateOptions, QueryOptions } from 'mongoose';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface IFindOptions<_T = any> {
  populate?: PopulateOptions | PopulateOptions[];
  sort?: QueryOptions['sort'];
  limit?: number;
  skip?: number;
  lean?: boolean;
  session?: ClientSession | null;
}

export interface ExtendedOptions {
  search?: string;
  searchFields?: string[];
  ranges?: Record<string, { min?: any; max?: any }>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type PaginateOpts<_T = any> = {
  page?: number;
  limit?: number;
  sort?: QueryOptions['sort'];
  populate?: PopulateOptions | PopulateOptions[];
  lean?: boolean;
  session?: ClientSession | null;
} & ExtendedOptions;
