import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsUUID, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InternStage, InternStatus } from '../../../common/constants/status.enum';

export class CreateInternDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  candidateId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  track?: string | null;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  learningPathId?: string;

  @ApiProperty()
  @IsUUID()
  mentorId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;
}

export class UpdateInternDto {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  candidateId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  track?: string | null;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  learningPathId?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  mentorId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ enum: InternStage, required: false })
  @IsEnum(InternStage)
  @IsOptional()
  currentStage?: InternStage;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  overallProgress?: number;

  @ApiProperty({ enum: InternStatus, required: false })
  @IsEnum(InternStatus)
  @IsOptional()
  status?: InternStatus;
}

export class MentorUpdateInternDto {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  learningPathId?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ enum: InternStatus, required: false })
  @IsEnum(InternStatus)
  @IsOptional()
  status?: InternStatus;
}
