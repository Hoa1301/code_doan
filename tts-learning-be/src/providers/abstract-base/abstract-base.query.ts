import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AbstractBaseQuery {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Items per page' })
  @IsOptional()
  @IsNumber()
  limit?: number = 10;

  @ApiPropertyOptional({
    // example: 'createdAt:desc',
    description: 'Sort string: "field:asc" or "field:desc"',
  })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({
    // example: 'search term',
    description: 'Search keyword for partial match',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
