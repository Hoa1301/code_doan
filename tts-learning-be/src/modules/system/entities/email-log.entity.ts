import { Entity, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { EmailTemplate } from './email-template.entity';

// UNUSED ENTITY:
// Not referenced by services/controllers/repositories or reverse relations.
// Kept in source for reference, but removed from active TypeORM module registration.

@Entity('email_logs')
export class EmailLog extends BaseEntity {
  @ManyToOne(() => EmailTemplate, { nullable: true })
  @JoinColumn({ name: 'template_id' })
  template: EmailTemplate;

  @Column({ name: 'template_id', nullable: true })
  templateId: string;

  @Column({ name: 'recipient_email' })
  recipientEmail: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ default: 'sent' })
  status: string; // sent, failed, pending

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: 'sent_at' })
  sentAt: Date;
}
