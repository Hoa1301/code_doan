import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Candidate } from '../recruitment/entities/candidate.entity';
import { Intern } from '../training/entities/intern.entity';
import { JobPosition } from '../recruitment/entities/job-position.entity';
import { Interview } from '../recruitment/entities/interview.entity';
import { Evaluation } from '../evaluation/entities/evaluation.entity';
import { DashboardController } from '../system/controllers/dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Candidate, Intern, JobPosition, Interview, Evaluation])],
  controllers: [DashboardController],
})
export class DashboardModule {}
