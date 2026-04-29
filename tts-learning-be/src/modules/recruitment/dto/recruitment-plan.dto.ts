import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RecruitmentPlanStatus } from '../../../common/constants/status.enum';

export class CreateRecruitmentPlanDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  batch: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}

export class UpdateRecruitmentPlanDto extends CreateRecruitmentPlanDto {
  @ApiProperty({ enum: RecruitmentPlanStatus, required: false })
  @IsEnum(RecruitmentPlanStatus)
  @IsOptional()
  status?: RecruitmentPlanStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
