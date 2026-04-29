import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class BatchMailRecipientDto {
  @ApiProperty({ example: 'candidate@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({ example: '08:00 25/02/2025' })
  @IsOptional()
  @IsString()
  interviewTime?: string;

  @ApiPropertyOptional({ example: 'Van phong Cong ty' })
  @IsOptional()
  @IsString()
  location?: string;

  [key: string]: string | undefined;
}

export class DirectMailRecipientDto extends BatchMailRecipientDto {
  @ApiProperty({ example: '<p>Hello candidate</p>' })
  @IsString()
  @IsNotEmpty()
  htmlBody: string;

  @IsOptional()
  @IsString()
  candidateName?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  department?: string;

  @IsOptional()
  interviewDate?: any;

  @IsOptional()
  locationLink?: any;

  @IsOptional()
  interviewerName?: any;

  @IsOptional()
  duration?: any;

  @IsOptional()
  format?: any;

  @IsOptional()
  interviewId?: any;

  @IsOptional()
  candidateId?: any;
}

export class SendBatchMailDto {
  @ApiProperty({ example: 'interview_invitation' })
  @IsString()
  @IsNotEmpty()
  templateCode: string;

  @ApiProperty({ type: [BatchMailRecipientDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BatchMailRecipientDto)
  recipients: BatchMailRecipientDto[];
}

export class SendDirectMailDto {
  @ApiProperty({ example: 'Thu moi phong van - Business Analyst' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ type: [DirectMailRecipientDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DirectMailRecipientDto)
  recipients: DirectMailRecipientDto[];
}
