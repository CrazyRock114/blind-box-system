/** @format */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Distributor } from '../../entities/distributor.entity';
import { DistributorLevel } from '../../entities/distributor-level.entity';
import { Commission } from '../../entities/commission.entity';
import { InviteCode } from '../../entities/invite-code.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Distributor, DistributorLevel, Commission, InviteCode]),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class DistributionModule {}
