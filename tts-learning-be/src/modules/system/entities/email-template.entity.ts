import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('email_templates')
export class EmailTemplate extends BaseEntity {
  @Column({ unique: true })
  code: string; // interview_invitation, rejection, offer, etc.

  @Column()
  name: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  body: string; // HTML template với placeholders {{name}}, {{date}}, etc.

  @Column({ type: 'jsonb', nullable: true })
  variables: string[]; // List of available variables
}
