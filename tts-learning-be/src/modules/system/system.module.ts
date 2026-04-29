import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailTemplate } from './entities/email-template.entity';
import { SystemSetting } from './entities/system-setting.entity';
import { Approval } from './entities/approval.entity';
import { RecruitmentPlan } from '../recruitment/entities/recruitment-plan.entity';
import { Candidate } from '../recruitment/entities/candidate.entity';
import { JobPosition } from '../recruitment/entities/job-position.entity';

// UNUSED ENTITIES:
// import { Notification } from './entities/notification.entity';
// import { EmailLog } from './entities/email-log.entity';
// import { FileUpload } from './entities/file-upload.entity';
// import { AuditLog } from './entities/audit-log.entity';

import { EmailTemplateService } from './services/email-template.service';
import { SystemSettingService } from './services/system-setting.service';
import { SeedService } from './services/seed.service';
import { ApprovalService } from './services/approval.service';

// UNUSED SERVICE:
// import { NotificationService } from './services/notification.service';

import { EmailTemplateController } from './controllers/email-template.controller';
import { SystemSettingController } from './controllers/system-setting.controller';
import { SeedController } from './controllers/seed.controller';
import { ApprovalController } from './controllers/approval.controller';
import { Department } from './entities/department.entity';
import { DepartmentController } from './controllers/department.controller';
import { DepartmentService } from './services/department.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmailTemplate,
      SystemSetting,
      Approval,
      RecruitmentPlan,
      Candidate,
      JobPosition,
      Department,
      // UNUSED ENTITIES:
      // Notification,
      // EmailLog,
      // FileUpload,
      // AuditLog,
    ]),
  ],
  controllers: [
    EmailTemplateController,
    SystemSettingController,
    SeedController,
    ApprovalController,
    DepartmentController,
  ],
  providers: [
    // UNUSED SERVICE:
    // NotificationService,
    EmailTemplateService,
    SystemSettingService,
    SeedService,
    ApprovalService,
    DepartmentService,
  ],
  exports: [
    // UNUSED SERVICE:
    // NotificationService,
    EmailTemplateService,
    SystemSettingService,
    SeedService,
    ApprovalService,
    TypeOrmModule,
    DepartmentService,
  ],
})
export class SystemModule {}
