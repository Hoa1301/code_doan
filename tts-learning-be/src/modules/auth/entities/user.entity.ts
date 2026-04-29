import { Entity, Column, OneToOne } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { UserStatus, RoleName } from '@/common/constants/roles.enum';

@Entity('users')
export class User extends BaseEntity {
  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash', select: false })
  passwordHash: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'email_verified_at', nullable: true })
  emailVerifiedAt: Date;

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt: Date;

  @Column({
    type: 'enum',
    enum: RoleName,
    default: RoleName.TTS, // Tts là loại user thấp nhất mặc định
  })
  role: RoleName;
}
