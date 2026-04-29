import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsUUID, IsNumber, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { InterviewStatus } from '../../../common/constants/status.enum';

export class CreateInterviewDto {
  @ApiProperty()
  @IsUUID()
  candidateId: string;

  @ApiProperty()
  @IsUUID()
  jobId: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  interviewDate: string;

  @ApiProperty({ example: '14:30' })
  @IsString()
  @IsNotEmpty()
  interviewTime: string;

  @ApiProperty({ default: 45 })
  @IsNumber()
  @IsOptional()
  durationMinutes?: number;

  @ApiProperty({ example: 'online' })
  @IsString()
  @IsNotEmpty()
  format: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  interviewerId?: string;
}

export class UpdateInterviewDto extends CreateInterviewDto {
  @ApiProperty({ enum: InterviewStatus, required: false })
  @IsEnum(InterviewStatus)
  @IsOptional()
  status?: InterviewStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  result?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  feedback?: string;
}

export class CreateBatchInterviewDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsNotEmpty()
  candidateIds: string[];

  @ApiProperty()
  @IsUUID()
  jobId: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  interviewDate: string;

  @ApiProperty({ example: '13:00' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: 30 })
  @IsNumber()
  intervalMinutes: number;

  @ApiProperty({ example: 'online' })
  @IsString()
  @IsNotEmpty()
  format: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  interviewerId?: string;
}
