import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../common/services/base.service';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { RoleName, UserStatus } from '../../common/constants/roles.enum';
import { StorageService } from '@/common/storage/storage.service';

@Injectable()
export class UsersService extends BaseService<User> {
  private static readonly FIXED_SUPER_ADMIN = {
    fullName: 'Super Admin',
    email: 'superadmin@system.com',
    password: '123456',
    role: RoleName.SUPER_ADMIN,
  };

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private storageService: StorageService,
  ) {
    super(userRepository);
  }

  async create(data: any): Promise<User> {
    const { email, password, fullName, phone, avatarUrl, role } = data;

    if (!fullName) {
      throw new BadRequestException('Họ và tên là bắt buộc');
    }

    if (!password || String(password).trim().length < 6) {
      throw new BadRequestException('Mật khẩu phải có ít nhất 6 ký tự');
    }

    // Kiểm tra email tồn tại
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email đã tồn tại trong hệ thống rồi nhé!');
    }

    // Hash mật khẩu
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({
      fullName,
      email,
      passwordHash,
      phone,
      avatarUrl,
      role: role || RoleName.TTS,
    });

    return await this.userRepository.save(user);
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'fullName', 'passwordHash', 'status', 'role'],
    });
  }

  async findOneWithRoles(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User NOT found');
    }
    return user;
  }

  async findByIdWithPassword(id: string) {
    return await this.userRepository.findOne({
      where: { id },
      select: ['id', 'passwordHash', 'status'],
    });
  }

  async updatePassword(id: string, newPassword: string) {
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(newPassword, salt);
    await this.userRepository.update(id, { passwordHash });
  }

  async updateLastLogin(id: string) {
    await this.userRepository.update(id, { lastLoginAt: new Date() });
  }

  async ensureFixedSuperAdminAccount() {
    const fixed = UsersService.FIXED_SUPER_ADMIN;
    const existing = await this.userRepository.findOne({
      where: { email: fixed.email },
      select: ['id', 'email', 'fullName', 'passwordHash', 'status', 'role'],
    });

    if (!existing) {
      await this.create({
        fullName: fixed.fullName,
        email: fixed.email,
        password: fixed.password,
        role: fixed.role,
      });
      return;
    }

    if (
      existing.fullName !== fixed.fullName ||
      existing.role !== fixed.role ||
      existing.status !== UserStatus.ACTIVE
    ) {
      await this.userRepository.update(existing.id, {
        fullName: fixed.fullName,
        role: fixed.role,
        status: UserStatus.ACTIVE,
      });
    }
  }
}
