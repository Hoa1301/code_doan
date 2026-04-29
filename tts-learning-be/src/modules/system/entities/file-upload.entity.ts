import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../auth/entities/user.entity';

// UNUSED ENTITY:
// Not referenced by services/controllers/repositories or reverse relations.
// Kept in source for reference, but removed from active TypeORM module registration.

@Entity('file_uploads')
export class FileUpload extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;

  @Column({ name: 'uploaded_by' })
  uploadedBy: string;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'file_path', type: 'text' })
  filePath: string;

  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize: number;

  @Column({ name: 'mime_type', nullable: true })
  mimeType: string;

  @Column({ name: 'entity_type', nullable: true })
  entityType: string; // candidate, task, report, etc.

  @Column({ name: 'entity_id', nullable: true })
  entityId: string;
}
