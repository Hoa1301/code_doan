import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuizQuestionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  options: string[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  correctAnswer: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  explanation?: string;

  @ApiProperty({ default: 10 })
  @IsNumber()
  points: number;
}

export class CreateQuizDto {
  @ApiProperty()
  @IsUUID()
  moduleId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNumber()
  passingScore: number;

  @ApiProperty()
  @IsNumber()
  timeLimit: number;

  @ApiProperty({ type: [CreateQuizQuestionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuizQuestionDto)
  questions: CreateQuizQuestionDto[];
}

export class UpdateQuizDto extends CreateQuizDto {}

export class CreateModuleContentDto {
  @ApiProperty()
  @IsUUID()
  moduleId: string;

  @ApiProperty({ example: 'video' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  contentUrl: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  durationMinutes?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  assessmentFileUrl?: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  documentUrls?: string[];
}

export class UpdateModuleContentDto {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  moduleId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  contentUrl?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  durationMinutes?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  assessmentFileUrl?: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  documentUrls?: string[];
}

export class SubmitQuizDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  quizId: string;

  @ApiProperty({ example: { 'question-uuid': 'Option A' } })
  @IsNotEmpty()
  answers: Record<string, string>;
}
