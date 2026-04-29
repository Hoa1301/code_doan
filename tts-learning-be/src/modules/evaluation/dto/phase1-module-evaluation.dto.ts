import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpsertPhase1ModuleEvaluationDto {
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  score?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  feedback?: string;

  @ApiProperty({ required: false, example: 'completed' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  submissionId?: string;
}
