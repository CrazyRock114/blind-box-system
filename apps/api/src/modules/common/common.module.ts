/** @format */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemConfig } from '../../entities/system-config.entity';
import { HealthController } from './health.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemConfig]),
  ],
  controllers: [HealthController],
  providers: [],
  exports: [],
})
export class CommonModule {}
