import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../../common/services/base.service';
import { SystemSetting } from '../entities/system-setting.entity';

@Injectable()
export class SystemSettingService extends BaseService<SystemSetting> {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly settingRepository: Repository<SystemSetting>,
  ) {
    super(settingRepository);
  }
}
