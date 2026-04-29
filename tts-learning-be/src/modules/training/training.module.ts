import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from '@/common/storage/storage.module';
import { Intern } from './entities/intern.entity';
import { LearningPath } from './entities/learning-path.entity';
import { Module as TrainingModuleEntity } from './entities/module.entity';
import { ModuleContent } from './entities/module-content.entity';
import { Quiz } from './entities/quiz.entity';
import { QuizQuestion } from './entities/quiz-question.entity';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { InternProgress } from './entities/intern-progress.entity';
import { Task } from './entities/task.entity';
import { TaskComment } from './entities/task-comment.entity';
import { ModuleFinalTest } from './entities/module-final-test.entity';
import { ModuleFinalTestSubmission } from './entities/module-final-test-submission.entity';

import { InternController } from './controllers/intern.controller';
import { LearningPathController } from './controllers/learning-path.controller';
import { TaskController } from './controllers/task.controller';
import { TrainingContentController } from './controllers/content.controller';
import { QuizController } from './controllers/quiz.controller';
import { TrainingModuleController } from './controllers/module.controller';
import { ModuleFinalTestController } from './controllers/module-final-test.controller';

import { InternService } from './services/intern.service';
import { LearningPathService } from './services/learning-path.service';
import { TrainingModuleService } from './services/module.service';
import { TaskService } from './services/task.service';
import { QuizService, ModuleContentService } from './services/content.service';
import { ModuleFinalTestService } from './services/module-final-test.service';

@Module({
  imports: [
    StorageModule,
    TypeOrmModule.forFeature([
      Intern,
      LearningPath,
      TrainingModuleEntity,
      ModuleContent,
      Quiz,
      QuizQuestion,
      QuizAttempt,
      InternProgress,
      Task,
      TaskComment,
      ModuleFinalTest,
      ModuleFinalTestSubmission,
    ]),
  ],
  controllers: [
    InternController,
    LearningPathController,
    TaskController,
    TrainingContentController,
    QuizController,
    TrainingModuleController,
    ModuleFinalTestController,
  ],
  providers: [
    InternService,
    LearningPathService,
    TrainingModuleService,
    TaskService,
    QuizService,
    ModuleContentService,
    ModuleFinalTestService,
  ],
  exports: [
    InternService,
    LearningPathService,
    TrainingModuleService,
    TaskService,
    QuizService,
    ModuleContentService,
    ModuleFinalTestService,
    TypeOrmModule,
  ],
})
export class TrainingModule {}
