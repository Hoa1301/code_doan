import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('approvals')
export class Approval extends BaseEntity {
  @Column()
  type: 'Conversion' | 'Recruitment';

  @Column()
  entityId: string;

  @Column()
  name: string; 

  @Column()
  title: string;

  @Column({ nullable: true })
  currentRole: string;

  @Column({ nullable: true })
  proposedRole: string;

  @Column({ nullable: true })
  mentor: string;

  @Column({ nullable: true, type: 'float' })
  score: number;

  @Column({ nullable: true, type: 'decimal' })
  salary: number;

  @Column({ nullable: true, type: 'decimal' })
  budget: number;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  hr: string;

  @Column({ default: 'Normal' })
  priority: 'High' | 'Normal' | 'Low';

  @Column({ default: 'Pending' })
  status: 'Pending' | 'Approved' | 'Rejected' | 'Adjusting';

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  details: any;
}
