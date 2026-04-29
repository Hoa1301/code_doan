import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEvaluationDto {
  @ApiProperty()
  @IsUUID()
  internId: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  mentorId?: string;

  @ApiProperty({ example: 'phase1' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  technicalScore?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  attitudeScore?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  teamworkScore?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  progressScore?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  overallScore?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  strengths?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  weaknesses?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  feedback?: string;

  @ApiProperty({ required: false, example: 'propose_hire' })
  @IsString()
  @IsOptional()
  decision?: string;

  @ApiProperty({ required: false, example: 'draft' })
  @IsString()
  @IsOptional()
  status?: string;
}

export class UpdateEvaluationDto extends CreateEvaluationDto {}
