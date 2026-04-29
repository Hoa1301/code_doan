import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SeedService } from '../services/seed.service';

@ApiTags('System - Seeding')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  @ApiOperation({ summary: 'Seed database với dữ liệu mẫu (Chỉ Admin)' })
  async seed() {
    await this.seedService.seed();
    return { message: 'Seeding completed successfully' };
  }
}
