import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpsertModuleFinalTestDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  materialFileName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  materialOriginalName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  materialLink?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class SubmitModuleFinalTestDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  submissionFileName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  submissionOriginalName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  submissionLink?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
