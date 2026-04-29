import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../../common/services/base.service';
import { Report } from '../entities/report.entity';

@Injectable()
export class ReportService extends BaseService<Report> {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {
    super(reportRepository);
  }
}
