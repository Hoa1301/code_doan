import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Permission } from './permission.entity';

// UNUSED ENTITY:
// Current auth flow uses enum RoleName on User instead of the roles table.
// Kept in source for reference, but removed from active TypeORM module registration.

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ unique: true })
  name: string; // admin, hr, mentor, director, intern, candidate

  @Column({ name: 'display_name' })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];
}
