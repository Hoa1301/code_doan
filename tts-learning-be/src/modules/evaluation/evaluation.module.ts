import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from '@/common/storage/storage.module';
import { TrainingModule } from '@/modules/training/training.module';
import { Evaluation } from './entities/evaluation.entity';
import { Report } from './entities/report.entity';
import { Phase1ModuleEvaluation } from './entities/phase1-module-evaluation.entity';
import { EvaluationService } from './services/evaluation.service';
import { Phase1EvaluationService } from './services/phase1-evaluation.service';
import { ReportService } from './services/report.service';
import { EvaluationController } from './controllers/evaluation.controller';
import { Phase1EvaluationController } from './controllers/phase1-evaluation.controller';
import { ReportController } from './controllers/report.controller';
import { Intern } from '@/modules/training/entities/intern.entity';
import { InternProgress } from '@/modules/training/entities/intern-progress.entity';
import { LearningPath } from '@/modules/training/entities/learning-path.entity';
import { Module as TrainingModuleEntity } from '@/modules/training/entities/module.entity';
import { ModuleFinalTest } from '@/modules/training/entities/module-final-test.entity';
import { ModuleFinalTestSubmission } from '@/modules/training/entities/module-final-test-submission.entity';

@Module({
  imports: [
    StorageModule,
    TrainingModule,
    TypeOrmModule.forFeature([
      Evaluation,
      Report,
      Phase1ModuleEvaluation,
      Intern,
      InternProgress,
      LearningPath,
      TrainingModuleEntity,
      ModuleFinalTest,
      ModuleFinalTestSubmission,
    ]),
  ],
  controllers: [EvaluationController, Phase1EvaluationController, ReportController],
  providers: [EvaluationService, Phase1EvaluationService, ReportService],
  exports: [EvaluationService, Phase1EvaluationService, ReportService, TypeOrmModule],
})
export class EvaluationModule {}
