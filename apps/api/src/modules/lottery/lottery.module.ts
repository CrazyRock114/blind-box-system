/**
 * 抽奖模块（增强版）
 * Phase 2 - 概率引擎模块配置
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LotteryService } from './lottery.service';
import { EnhancedLotteryService } from './lottery.service.enhanced';
import { LotteryController } from './lottery.controller';
import { LotteryAdminController } from './lottery-admin.controller';
import { LotteryEngine } from './lottery.engine';
import { EnhancedLotteryEngine } from './lottery-engine.enhanced';
import { LotteryRecord } from './lottery-record.entity';
import { BoxPool } from '../box/box-pool.entity';
import { Prize } from '../box/prize.entity';
import { WalletModule } from '../wallet/wallet.module';
import { GuaranteeRedisService } from './guarantee/guarantee-redis.service';
import { PoolConfigService } from './config/pool-config.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LotteryRecord, BoxPool, Prize]),
    WalletModule,
  ],
  providers: [
    // 原有服务（兼容）
    LotteryService,
    LotteryEngine,
    
    // 增强版服务
    EnhancedLotteryService,
    EnhancedLotteryEngine,
    
    // 保底和配置服务
    GuaranteeRedisService,
    PoolConfigService,
  ],
  controllers: [
    LotteryController,
    LotteryAdminController,
  ],
  exports: [
    LotteryService,
    EnhancedLotteryService,
    LotteryEngine,
    EnhancedLotteryEngine,
    GuaranteeRedisService,
    PoolConfigService,
  ],
})
export class LotteryModule {}
