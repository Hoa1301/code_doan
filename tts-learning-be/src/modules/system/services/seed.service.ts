import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../auth/entities/user.entity';
import { RoleName } from '../../../common/constants/roles.enum';
import { RecruitmentPlan } from '../../recruitment/entities/recruitment-plan.entity';
import { JobPosition } from '../../recruitment/entities/job-position.entity';
import { Candidate } from '../../recruitment/entities/candidate.entity';
import {
  CandidateStatus,
  JobPositionStatus,
  RecruitmentPlanStatus,
  TaskStatus,
  InternStage,
  InternStatus,
} from '../../../common/constants/status.enum';
import { Intern } from '../../training/entities/intern.entity';
import { LearningPath } from '../../training/entities/learning-path.entity';
import { Module } from '../../training/entities/module.entity';
import { Task } from '../../training/entities/task.entity';
import { Evaluation } from '../../evaluation/entities/evaluation.entity';
import { Department } from '../entities/department.entity';
import { Approval } from '../entities/approval.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private dataSource: DataSource) {}

  async seed() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log('Seeding started...');

      // 1. Seed Users
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash('123456', salt);

      const users = [
        { fullName: 'Super Admin', email: 'superadmin@system.com', passwordHash, role: RoleName.SUPER_ADMIN },
        { fullName: 'Admin System', email: 'admin@system.com', passwordHash, role: RoleName.ADMIN },
        { fullName: 'HR Manager', email: 'hr@system.com', passwordHash, role: RoleName.HR },
        { fullName: 'Mentor John', email: 'mentor@system.com', passwordHash, role: RoleName.MENTOR },
        {
          fullName: 'Director Sam',
          email: 'director@system.com',
          passwordHash,
          role: RoleName.DIRECTOR,
        },
        { fullName: 'Intern Bob', email: 'intern@system.com', passwordHash, role: RoleName.TTS },
      ];

      const userMap = new Map<string, User>();
      for (const u of users) {
        let user = await queryRunner.manager.findOne(User, { where: { email: u.email } });
        if (!user) {
          user = queryRunner.manager.create(User, u);
          user = await queryRunner.manager.save(user);
        }
        userMap.set(u.email, user);
      }

      // 12. Seed Departments
      const departments = [
        { value: 'Developer', label: 'Developer' },
        { value: 'DnA', label: 'DnA' },
        { value: 'HR & Admin', label: 'HR & Admin' },
        { value: 'Kinh doanh', label: 'Kinh doanh' },
        { value: 'Logistics', label: 'Logistics' },
        { value: 'Marketing', label: 'Marketing' },
        { value: 'Network', label: 'Network' },
        { value: 'PM', label: 'PM' },
        { value: 'Sale', label: 'Sale' },
        { value: 'Service', label: 'Service' },
        { value: 'Solution', label: 'Solution' },
        { value: 'System', label: 'System' },
        { value: 'Tender', label: 'Tender' },
      ];

      for (const d of departments) {
        const exist = await queryRunner.manager.findOne(Department, {
          where: { value: d.value },
        });

        if (!exist) {
          const dept = queryRunner.manager.create(Department, d);
          await queryRunner.manager.save(dept);
        }
      }
      await queryRunner.commitTransaction();
      this.logger.log('Seeding completed successfully!');
    } catch (err) {
      this.logger.error('Seeding failed: ' + err.message);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
