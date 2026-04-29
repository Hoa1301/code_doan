import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseType } from './types/database.type';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
@Module({})
export class DatabaseModule {
  /**
   * Hàm kết nối duy nhất cho cả Mongo và Postgres
   * @param type Loại database (DatabaseType.MONGODB hoặc DatabaseType.POSTGRES)
   * @param configKey Key trong file config (vd: 'mongo.uri' hoặc 'postgres.config')
   * @param connectionName Tên định danh connection (optional)
   */
  static forRootAsync(type: DatabaseType, configKey: string, connectionName?: string): DynamicModule {
    // --- CASE 1: MONGODB ---
    if (type === DatabaseType.MONGODB) {
      return {
        module: DatabaseModule,
        imports: [
          MongooseModule.forRootAsync({
            connectionName: connectionName,
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
              const uri = configService.get<string>(configKey);
              if (!uri) throw new Error(`[MongoDB] Missing URI for key: ${configKey}`);
              return { uri };
            },
          }),
        ],
        exports: [MongooseModule], // Export để các feature module dùng forFeature
      };
    }

    // --- CASE 2: POSTGRESQL ---
    if (type === DatabaseType.POSTGRES) {
      return {
        module: DatabaseModule,
        imports: [
          TypeOrmModule.forRootAsync({
            name: connectionName, // TypeORM dùng 'name' để định danh connection
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
              const dbConfig = configService.get(configKey);
              if (!dbConfig) throw new Error(`[Postgres] Missing config for key: ${configKey}`);

              return {
                type: 'postgres',
                host: dbConfig.host,
                port: dbConfig.port,
                username: dbConfig.username,
                password: dbConfig.password,
                database: dbConfig.database,
                autoLoadEntities: true,
                synchronize: true, // Cẩn thận: Chỉ dùng cho DEV
              };
            },
          }),
        ],
        exports: [TypeOrmModule], // Export để các feature module dùng forFeature
      };
    }

    // --- CASE ERROR ---
    throw new Error(`Unsupported Database Type: ${type}`);
  }
}
