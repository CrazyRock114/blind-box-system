/** @format */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemConfig } from '../../entities/system-config.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemConfig]),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class CommonModule {}
