import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateModuleDto {
  @ApiProperty()
  @IsUUID()
  learningPathId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNumber()
  orderIndex: number;

  @ApiProperty({ required: false, default: 80 })
  @IsNumber()
  @IsOptional()
  passingScore?: number;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;
}

export class UpdateModuleDto {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  learningPathId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  orderIndex?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  passingScore?: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  status?: string;
}

export class ReorderModuleItemDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsNumber()
  orderIndex: number;
}

export class ReorderModulesDto {
  @ApiProperty({ type: [ReorderModuleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderModuleItemDto)
  modules: ReorderModuleItemDto[];
}
