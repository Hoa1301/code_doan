import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JobPositionStatus } from '../../../common/constants/status.enum';

export class CreateJobPositionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsUUID()
  recruitmentPlanId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  requiredQuantity: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  requirements?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  benefits?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  salaryRange?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  deadline?: string;
}

export class UpdateJobPositionDto extends CreateJobPositionDto {
  @ApiProperty({ enum: JobPositionStatus, required: false })
  @IsEnum(JobPositionStatus)
  @IsOptional()
  status?: JobPositionStatus;
}
