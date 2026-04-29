import { IsString, IsNotEmpty, IsOptional, IsEnum, IsEmail, IsArray, IsUUID, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CandidateStatus } from '../../../common/constants/status.enum';

export class CreateCandidateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty()
  @IsUUID()
  jobId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  resumeUrl?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  education?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  experience?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  coverLetter?: string;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  skills?: string[];
}

export class UpdateCandidateDto extends CreateCandidateDto {
  @ApiProperty({ enum: CandidateStatus, required: false })
  @IsEnum(CandidateStatus)
  @IsOptional()
  status?: CandidateStatus;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  matchScore?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}

export class ConvertCandidateToInternDto {
  @ApiProperty()
  @IsUUID()
  mentorId: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  learningPathId?: string;
}
