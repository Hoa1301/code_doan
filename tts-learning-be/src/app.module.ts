import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './common/configs/configuration';
import { DatabaseModule } from './common/databases/database.module';
import { DatabaseType } from './common/databases/types/database.type';
import { AuthModule } from './modules/auth/auth.module';
import { RecruitmentModule } from './modules/recruitment/recruitment.module';
import { TrainingModule } from './modules/training/training.module';
import { EvaluationModule } from './modules/evaluation/evaluation.module';
import { SystemModule } from './modules/system/system.module';
import { SocketModule } from './providers/socket/socket.module';
import { MailProviderModule } from './providers/mailer/mailer.module';
import { StorageModule } from './common/storage/storage.module';
import { DashboardModule } from './modules/system/dashboard.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
      expandVariables: true,
    }),

    DatabaseModule.forRootAsync(DatabaseType.POSTGRES, 'postgres.config'),

    StorageModule,
    //- TTS Learning Modules
    AuthModule,
    RecruitmentModule,
    TrainingModule,
    EvaluationModule,
    SystemModule,
    DashboardModule,

    SocketModule,
    MailProviderModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
