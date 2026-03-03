/**
 * 抽奖模块导出
 * Phase 2 - 概率引擎
 */

// 实体
export { LotteryRecord, LotteryType, LotteryStatus } from './lottery-record.entity';

// 服务
export { LotteryService } from './lottery.service';
export { EnhancedLotteryService } from './lottery.service.enhanced';
export { LotteryEngine } from './lottery.engine';
export { EnhancedLotteryEngine } from './lottery-engine.enhanced';

// 保底相关
export { GuaranteeRedisService } from './guarantee/guarantee-redis.service';
export { 
  GuaranteeType,
  GuaranteeConfig,
  UserGuaranteeState,
  DrawContext,
  LotteryAlgorithmConfig,
  PoolRealtimeConfig,
  PrizeRealtimeConfig,
  LotteryAuditRecord,
  HotUpdatePoolDTO,
  HotUpdatePrizeDTO,
} from './guarantee/guarantee.types';

// 配置服务
export { PoolConfigService } from './config/pool-config.service';

// 控制器
export { LotteryController } from './lottery.controller';
export { LotteryAdminController } from './lottery-admin.controller';

// 模块
export { LotteryModule } from './lottery.module';
