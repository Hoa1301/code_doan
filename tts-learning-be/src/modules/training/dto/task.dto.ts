import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '../../../common/constants/status.enum';

export class CreateTaskDto {
  @ApiProperty()
  @IsUUID()
  internId: string;

  @ApiProperty()
  @IsUUID()
  mentorId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsDateString()
  dueDate: string;

  @ApiProperty({ required: false, default: 'medium' })
  @IsString()
  @IsOptional()
  priority?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  attachments?: string[];
}

export class UpdateTaskDto {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  internId?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  mentorId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  priority?: string;

  @ApiProperty({ enum: TaskStatus, required: false })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  attachments?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  revisionRequest?: string;
}

export class CreateTaskCommentDto {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  taskId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  attachments?: string[];
}
