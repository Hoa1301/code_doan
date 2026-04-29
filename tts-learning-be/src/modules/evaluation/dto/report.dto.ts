import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReportStatus } from '../../../common/constants/status.enum';

export class CreateReportDto {
  @ApiProperty()
  @IsUUID()
  internId: string;

  @ApiProperty({ example: 'weekly' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 'Tuần 1 - Feb 2025' })
  @IsString()
  @IsNotEmpty()
  period: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  challenges?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  nextPlan?: string;
}

export class UpdateReportDto extends CreateReportDto {
  @ApiProperty({ enum: ReportStatus, required: false })
  @IsEnum(ReportStatus)
  @IsOptional()
  status?: ReportStatus;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  score?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  feedback?: string;
}
