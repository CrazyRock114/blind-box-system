/** @format */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ichiban } from '../../entities/ichiban.entity';
import { IchibanPool } from '../../entities/ichiban-pool.entity';
import { IchibanQueue } from '../../entities/ichiban-queue.entity';
import { IchibanDraw } from '../../entities/ichiban-draw.entity';
import { Tower } from '../../entities/tower.entity';
import { TowerLevel } from '../../entities/tower-level.entity';
import { TowerAttempt } from '../../entities/tower-attempt.entity';
import { TowerReward } from '../../entities/tower-reward.entity';
import { Gacha } from '../../entities/gacha.entity';
import { GachaSeries } from '../../entities/gacha-series.entity';
import { GachaDraw } from '../../entities/gacha-draw.entity';
import { Fragment } from '../../entities/fragment.entity';
import { UserFragment } from '../../entities/user-fragment.entity';
import { RecycleRecord } from '../../entities/recycle-record.entity';
import { LuckyCoin } from '../../entities/lucky-coin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // 一番赏
      Ichiban, IchibanPool, IchibanQueue, IchibanDraw,
      // 爬塔
      Tower, TowerLevel, TowerAttempt, TowerReward,
      // 扭蛋
      Gacha, GachaSeries, GachaDraw, Fragment, UserFragment,
      // 其他
      RecycleRecord, LuckyCoin,
    ]),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class BlindboxModule {}
