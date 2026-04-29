import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateDateColumn, UpdateDateColumn, Column, PrimaryGeneratedColumn } from 'typeorm';

export abstract class TypeOrmBaseEntity {
  @PrimaryGeneratedColumn('uuid') // Or number, depending on preference
  @ApiProperty()
  id: string;

  @Column({ default: false })
  @ApiProperty()
  isDeleted: boolean;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  @ApiProperty()
  createdAt: Date;

  @Column({ nullable: true })
  @ApiProperty()
  createdBy: string;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  @ApiPropertyOptional()
  updatedAt: Date;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  updatedBy: string;
}
