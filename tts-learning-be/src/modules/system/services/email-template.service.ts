import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../../common/services/base.service';
import { EmailTemplate } from '../entities/email-template.entity';

@Injectable()
export class EmailTemplateService extends BaseService<EmailTemplate> {
  constructor(
    @InjectRepository(EmailTemplate)
    private readonly templateRepository: Repository<EmailTemplate>,
  ) {
    super(templateRepository);
  }

  async findByCode(code: string): Promise<EmailTemplate | null> {
    return await this.templateRepository.findOne({ where: { code } });
  }
}
