import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

// UNUSED ENTITY:
// Current auth flow uses enum RoleName on User instead of role-permission tables.
// Kept in source for reference, but removed from active TypeORM module registration.

@Entity('permissions')
export class Permission extends BaseEntity {
  @Column({ unique: true })
  name: string; // recruitment.plan.create, etc.

  @Column({ name: 'display_name' })
  displayName: string;

  @Column()
  module: string; // recruitment, training, evaluation, admin

  @Column({ type: 'text', nullable: true })
  description: string;
}
