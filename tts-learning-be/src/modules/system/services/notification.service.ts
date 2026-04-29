import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../../common/services/base.service';
import { Notification } from '../entities/notification.entity';

// UNUSED SERVICE:
// No controller or module currently consumes this service after Notification was removed from runtime registration.

@Injectable()
export class NotificationService extends BaseService<Notification> {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {
    super(notificationRepository);
  }

  async markAsRead(id: string): Promise<Notification> {
    return await this.update(id, { isRead: true, readAt: new Date() } as any);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update({ userId, isRead: false }, { isRead: true, readAt: new Date() });
  }
}
