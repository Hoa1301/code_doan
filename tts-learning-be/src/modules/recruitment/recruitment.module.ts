import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecruitmentPlan } from './entities/recruitment-plan.entity';
import { JobPosition } from './entities/job-position.entity';
import { Candidate } from './entities/candidate.entity';
import { Interview } from './entities/interview.entity';
import { Approval } from '../system/entities/approval.entity';

// UNUSED ENTITY:
// import { Role } from '../auth/entities/role.entity';

import { RecruitmentPlanController } from './controllers/recruitment-plan.controller';
import { JobPositionController } from './controllers/job-position.controller';
import { CandidateController } from './controllers/candidate.controller';
import { InterviewController } from './controllers/interview.controller';
import { RecruitmentMailController } from './controllers/recruitment-mail.controller';

import { RecruitmentPlanService } from './services/recruitment-plan.service';
import { JobPositionService } from './services/job-position.service';
import { CandidateService } from './services/candidate.service';
import { InterviewService } from './services/interview.service';
import { BatchMailService } from './services/batch-mail.service';

import { AuthModule } from '../auth/auth.module';
import { TrainingModule } from '../training/training.module';
import { SystemModule } from '../system/system.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecruitmentPlan,
      JobPosition,
      Candidate,
      Interview,
      Approval,
      // UNUSED ENTITY:
      // Role,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => TrainingModule),
    SystemModule,
  ],
  controllers: [
    RecruitmentPlanController,
    JobPositionController,
    CandidateController,
    InterviewController,
    RecruitmentMailController,
  ],
  providers: [RecruitmentPlanService, JobPositionService, CandidateService, InterviewService, BatchMailService],
  exports: [
    RecruitmentPlanService,
    JobPositionService,
    CandidateService,
    InterviewService,
    BatchMailService,
    TypeOrmModule,
  ],
})
export class RecruitmentModule {}
