import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './modules/system/services/seed.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = new Logger('SeedScript');

  try {
    const seedService = app.get(SeedService);
    logger.log('Starting standalone seeding process...');
    await seedService.seed();
    logger.log('Standalone seeding process completed successfully!');
  } catch (error) {
    logger.error('Seeding process failed!', error.stack);
  } finally {
    await app.close();
  }
}

bootstrap();
