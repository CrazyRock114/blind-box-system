/**
 * 增强版抽奖引擎
 * Phase 2 - 概率引擎核心实现
 * 
 * 功能：
 * 1. 加权随机算法
 * 2. 保底机制（连续、层级、全局）
 * 3. 热更新支持
 * 4. 库存实时校验
 * 5. 抽奖审计
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Prize, PrizeLevel } from '../../box/prize.entity';
import { BoxPool, BoxType } from '../../box/box-pool.entity';
import { LotteryRecord, LotteryType, LotteryStatus } from './lottery-record.entity';
import { GuaranteeRedisService } from './guarantee/guarantee-redis.service';
import { PoolConfigService } from './config/pool-config.service';
import { 
  LotteryResult, 
  DrawContext,
  PrizeRealtimeConfig,
  GuaranteeConfig,
  GuaranteeType,
  LotteryAuditRecord,
} from './guarantee/guarantee.types';

export { LotteryResult } from './guarantee/guarantee.types';

@Injectable()
export class EnhancedLotteryEngine {
  private readonly logger = new Logger(EnhancedLotteryEngine.name);

  constructor(
    @InjectRepository(BoxPool)
    private boxPoolRepo: Repository<BoxPool>,
    @InjectRepository(Prize)
    private prizeRepo: Repository<Prize>,
    @InjectRepository(LotteryRecord)
    private lotteryRepo: Repository<LotteryRecord>,
    private dataSource: DataSource,
    private guaranteeRedis: GuaranteeRedisService,
    private poolConfig: PoolConfigService,
  ) {}

  /**
   * 执行加权随机抽奖（增强版）
   */
  async weightedLottery(
    userId: string,
    boxPoolId: string,
    context?: Partial<DrawContext>,
  ): Promise<LotteryResult> {
    const drawContext: DrawContext = {
      userId,
      boxPoolId,
      drawTime: Date.now(),
      ...context,
    };

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const startTime = Date.now();
    let auditRecord: Partial<LotteryAuditRecord> = {
      userId,
      boxPoolId,
      timestamp: startTime,
    };

    try {
      // 1. 获取奖池配置（支持热更新）
      const poolConfig = await this.poolConfig.getPoolConfig(boxPoolId);
      if (!poolConfig) {
        return { success: false, message: '奖池配置不存在' };
      }

      // 2. 获取分布式锁（防止并发问题）
      const lockValue = await this.guaranteeRedis.acquireLock(boxPoolId, 5);
      if (!lockValue) {
        return { success: false, message: '系统繁忙，请稍后重试' };
      }

      try {
        // 3. 获取有库存的奖品
        const availablePrizes = poolConfig.prizes.filter(p => p.stock > 0);
        if (availablePrizes.length === 0) {
          return { success: false, message: '奖品已售罄' };
        }

        // 4. 检查保底机制
        const { selectedPrize, guaranteeTriggered } = await this.selectPrizeWithGuarantee(
          userId,
          boxPoolId,
          availablePrizes,
          poolConfig.guarantees,
          poolConfig.algorithm.enableGuarantee
        );

        if (!selectedPrize) {
          return { success: false, message: '奖品选择失败' };
        }

        // 5. 乐观锁扣减库存
        const stockResult = await this.deductStockWithOptimisticLock(
          queryRunner,
          selectedPrize.prizeId
        );

        if (!stockResult.success) {
          // 库存不足，尝试选择其他奖品
          const alternativePrize = await this.findAlternativePrize(
            availablePrizes,
            selectedPrize.prizeId
          );
          
          if (!alternativePrize) {
            return { success: false, message: '奖品库存不足' };
          }

          const altResult = await this.deductStockWithOptimisticLock(
            queryRunner,
            alternativePrize.prizeId
          );

          if (!altResult.success) {
            return { success: false, message: '奖品库存不足' };
          }

          // 使用备选奖品
          selectedPrize.prizeId = alternativePrize.prizeId;
        }

        // 6. 获取完整奖品信息
        const fullPrize = await queryRunner.manager.findOne(Prize, {
          where: { id: selectedPrize.prizeId },
        }) as Prize;

        if (!fullPrize) {
          return { success: false, message: '奖品信息不存在' };
        }

        // 7. 创建抽奖记录
        const record = queryRunner.manager.create(LotteryRecord, {
          userId,
          boxPoolId,
          prizeId: fullPrize.id,
          type: LotteryType.NORMAL,
          costAmount: 0, // 由上层设置
          costType: 'balance',
          status: LotteryStatus.SUCCESS,
          metadata: JSON.stringify({
            guaranteeTriggered,
            algorithmVersion: poolConfig.version,
          }),
        });

        const savedRecord = await queryRunner.manager.save(record);

        // 8. 更新保底状态
        if (guaranteeTriggered) {
          await this.resetGuaranteeStates(userId, boxPoolId, poolConfig.guarantees);
          await this.guaranteeRedis.markGuaranteeTriggered(userId, boxPoolId, GuaranteeType.CONSECUTIVE);
        } else {
          await this.updateGuaranteeStates(userId, boxPoolId, fullPrize.level, poolConfig.guarantees);
        }

        // 9. 更新统计
        await this.guaranteeRedis.incrementPoolStats(boxPoolId, guaranteeTriggered);

        // 10. 填充审计记录
        auditRecord.prizeId = fullPrize.id;
        auditRecord.guaranteeTriggered = guaranteeTriggered;
        auditRecord.stockAfter = stockResult.newStock || fullPrize.stock - 1;
        auditRecord.duration = Date.now() - startTime;
        await this.saveAuditRecord(auditRecord as LotteryAuditRecord);

        await queryRunner.commitTransaction();

        return {
          success: true,
          prize: fullPrize,
          record: savedRecord,
          guaranteeTriggered,
        };
      } finally {
        // 释放分布式锁
        await this.guaranteeRedis.releaseLock(boxPoolId, lockValue);
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`抽奖失败: ${error.message}`, error.stack);
      return { success: false, message: '抽奖失败: ' + error.message };
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 带保底的奖品选择
   */
  private async selectPrizeWithGuarantee(
    userId: string,
    boxPoolId: string,
    availablePrizes: PrizeRealtimeConfig[],
    guaranteeConfigs: GuaranteeConfig[],
    enableGuarantee: boolean,
  ): Promise<{ selectedPrize: PrizeRealtimeConfig; guaranteeTriggered: boolean }> {
    
    if (!enableGuarantee || guaranteeConfigs.length === 0) {
      // 不启用保底，使用普通权重抽奖
      const prize = this.weightedRandom(availablePrizes);
      return { selectedPrize: prize, guaranteeTriggered: false };
    }

    // 按优先级排序保底配置
    const sortedConfigs = [...guaranteeConfigs]
      .filter(c => c.enabled)
      .sort((a, b) => a.priority - b.priority);

    // 检查每个保底条件
    for (const config of sortedConfigs) {
      const triggered = await this.guaranteeRedis.checkGuaranteeTriggered(userId, boxPoolId, config);
      
      if (triggered) {
        // 保底触发，选择对应等级的奖品
        const guaranteePrizes = availablePrizes.filter(p => p.level === config.guaranteeLevel);
        
        if (guaranteePrizes.length > 0) {
          // 在保底等级内随机选择
          const selected = guaranteePrizes[Math.floor(Math.random() * guaranteePrizes.length)];
          this.logger.log(`保底触发! 用户: ${userId}, 奖池: ${boxPoolId}, 等级: ${config.guaranteeLevel}`);
          return { selectedPrize: selected, guaranteeTriggered: true };
        }
      }
    }

    // 未触发保底，使用普通权重抽奖
    const prize = this.weightedRandom(availablePrizes);
    return { selectedPrize: prize, guaranteeTriggered: false };
  }

  /**
   * 权重随机算法
   */
  private weightedRandom(prizes: PrizeRealtimeConfig[]): PrizeRealtimeConfig {
    const totalWeight = prizes.reduce((sum, p) => sum + (p.dynamicWeight || p.weight), 0);
    let random = Math.random() * totalWeight;

    for (const prize of prizes) {
      const weight = prize.dynamicWeight || prize.weight;
      if (random < weight) {
        return prize;
      }
      random -= weight;
    }

    // 兜底返回最后一个
    return prizes[prizes.length - 1];
  }

  /**
   * 乐观锁扣减库存
   */
  private async deductStockWithOptimisticLock(
    queryRunner: any,
    prizeId: string,
  ): Promise<{ success: boolean; newStock?: number }> {
    // 获取当前库存和版本
    const prize = await queryRunner.manager.findOne(Prize, {
      where: { id: prizeId },
      select: ['id', 'stock', 'soldCount'],
    });

    if (!prize || prize.stock <= 0) {
      return { success: false };
    }

    // 使用乐观锁更新
    const result = await queryRunner.manager.update(
      Prize,
      { 
        id: prizeId, 
        stock: prize.stock // 条件：库存必须和查询时一致
      },
      {
        stock: () => 'stock - 1',
        soldCount: () => 'sold_count + 1',
      }
    );

    if (result.affected === 0) {
      // 乐观锁失败，库存已被其他请求扣减
      return { success: false };
    }

    return { success: true, newStock: prize.stock - 1 };
  }

  /**
   * 寻找备选奖品
   */
  private async findAlternativePrize(
    availablePrizes: PrizeRealtimeConfig[],
    excludePrizeId: string,
  ): Promise<PrizeRealtimeConfig | null> {
    const alternatives = availablePrizes.filter(p => p.prizeId !== excludePrizeId);
    if (alternatives.length === 0) {
      return null;
    }
    return this.weightedRandom(alternatives);
  }

  /**
   * 更新保底状态（未中奖时）
   */
  private async updateGuaranteeStates(
    userId: string,
    boxPoolId: string,
    prizeLevel: PrizeLevel,
    configs: GuaranteeConfig[],
  ): Promise<void> {
    for (const config of configs) {
      if (!config.enabled) continue;

      switch (config.type) {
        case GuaranteeType.CONSECUTIVE:
        case GuaranteeType.GLOBAL:
          await this.guaranteeRedis.incrementConsecutiveCount(userId, boxPoolId, config.type);
          break;
        
        case GuaranteeType.LEVEL:
          // 只有未中保底等级的奖品时，才增加对应等级的计数
          if (prizeLevel !== config.guaranteeLevel) {
            await this.guaranteeRedis.incrementLevelCount(userId, boxPoolId, config.guaranteeLevel);
          }
          break;
      }
    }
  }

  /**
   * 重置保底状态（中奖时）
   */
  private async resetGuaranteeStates(
    userId: string,
    boxPoolId: string,
    configs: GuaranteeConfig[],
  ): Promise<void> {
    for (const config of configs) {
      if (!config.enabled) continue;

      switch (config.type) {
        case GuaranteeType.CONSECUTIVE:
        case GuaranteeType.GLOBAL:
          await this.guaranteeRedis.resetConsecutiveCount(userId, boxPoolId, config.type);
          break;
        
        case GuaranteeType.LEVEL:
          await this.guaranteeRedis.resetLevelCount(userId, boxPoolId, config.guaranteeLevel);
          break;
      }
    }
  }

  /**
   * 保存审计记录
   */
  private async saveAuditRecord(record: LotteryAuditRecord): Promise<void> {
    // 可以保存到文件、数据库或发送到消息队列
    // 这里使用debug日志记录
    this.logger.debug(`抽奖审计: ${JSON.stringify(record)}`);
  }

  /**
   * 一番赏抽奖（增强版）
   */
  async ichibanLottery(
    userId: string,
    boxPoolId: string,
    context?: Partial<DrawContext>,
  ): Promise<LotteryResult> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 获取分布式锁
      const lockValue = await this.guaranteeRedis.acquireLock(boxPoolId, 5);
      if (!lockValue) {
        return { success: false, message: '系统繁忙，请稍后重试' };
      }

      try {
        const boxPool = await queryRunner.manager.findOne(BoxPool, {
          where: { id: boxPoolId, type: BoxType.ICHIBAN },
          relations: ['prizes'],
        }) as BoxPool & { prizes: Prize[] };

        if (!boxPool) {
          return { success: false, message: '一番赏不存在' };
        }

        if (boxPool.soldTickets >= boxPool.totalTickets) {
          return { success: false, message: '该套一番赏已售罄' };
        }

        // 判断是否Last赏（全局保底）
        const isLastTicket = boxPool.soldTickets + 1 === boxPool.totalTickets;

        let selectedPrize: Prize;

        if (isLastTicket && boxPool.lastPrizeId) {
          // Last赏
          selectedPrize = boxPool.prizes.find(p => p.id === boxPool.lastPrizeId)!;
        } else {
          // 随机抽取剩余奖品
          const availablePrizes = boxPool.prizes.filter(p => p.stock > 0);
          if (availablePrizes.length === 0) {
            return { success: false, message: '奖品已售罄' };
          }

          const randomIndex = Math.floor(Math.random() * availablePrizes.length);
          selectedPrize = availablePrizes[randomIndex];
        }

        // 扣除库存
        await queryRunner.manager.decrement(Prize, { id: selectedPrize.id }, 'stock', 1);
        await queryRunner.manager.increment(Prize, { id: selectedPrize.id }, 'soldCount', 1);
        await queryRunner.manager.increment(BoxPool, { id: boxPoolId }, 'soldTickets', 1);

        // 创建记录
        const record = queryRunner.manager.create(LotteryRecord, {
          userId,
          boxPoolId,
          prizeId: selectedPrize.id,
          type: LotteryType.ICHIBAN,
          costAmount: boxPool.price,
          costType: 'balance',
          status: LotteryStatus.SUCCESS,
          ticketNumber: boxPool.soldTickets + 1,
          metadata: JSON.stringify({ isLastTicket }),
        });

        const savedRecord = await queryRunner.manager.save(record);

        await queryRunner.commitTransaction();

        return {
          success: true,
          prize: selectedPrize,
          record: savedRecord,
          guaranteeTriggered: isLastTicket,
        };
      } finally {
        await this.guaranteeRedis.releaseLock(boxPoolId, lockValue);
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return { success: false, message: '抽奖失败: ' + error.message };
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 爬塔抽奖（增强版）
   */
  async towerLottery(
    userId: string,
    boxPoolId: string,
    currentFloor: number,
    context?: Partial<DrawContext>,
  ): Promise<LotteryResult & { isClimbSuccess?: boolean; newFloor?: number }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const boxPool = await queryRunner.manager.findOne(BoxPool, {
        where: { id: boxPoolId, type: BoxType.TOWER },
        relations: ['prizes'],
      }) as BoxPool & { prizes: Prize[] };

      if (!boxPool) {
        return { success: false, message: '爬塔不存在' };
      }

      const floorPrizes = boxPool.prizes.filter(p => p.stock > 0);
      if (floorPrizes.length === 0) {
        return { success: false, message: '奖品已售罄' };
      }

      // 根据层数计算成功率
      const successRate = Math.max(0.1, 1 - (currentFloor / boxPool.maxFloors) * 0.8);
      const isClimbSuccess = Math.random() < successRate;

      let selectedPrize: Prize | null = null;

      if (isClimbSuccess) {
        // 爬塔成功，获得当前层奖品
        const totalWeight = floorPrizes.reduce((sum, p) => sum + p.weight, 0);
        let random = Math.random() * totalWeight;

        for (const prize of floorPrizes) {
          if (random < prize.weight) {
            selectedPrize = prize;
            break;
          }
          random -= prize.weight;
        }

        if (!selectedPrize) {
          selectedPrize = floorPrizes[floorPrizes.length - 1];
        }

        await queryRunner.manager.decrement(Prize, { id: selectedPrize.id }, 'stock', 1);
        await queryRunner.manager.increment(Prize, { id: selectedPrize.id }, 'soldCount', 1);
      }

      const newFloor = isClimbSuccess ? Math.min(currentFloor + 1, boxPool.maxFloors) : 1;

      // 创建记录
      const record = queryRunner.manager.create(LotteryRecord, {
        userId,
        boxPoolId,
        prizeId: selectedPrize?.id || null,
        type: LotteryType.TOWER,
        costAmount: boxPool.price,
        costType: 'balance',
        status: LotteryStatus.SUCCESS,
        floorNumber: currentFloor,
        isClimbSuccess,
      });

      const savedRecord = await queryRunner.manager.save(record);
      await queryRunner.commitTransaction();

      return {
        success: true,
        prize: selectedPrize,
        record: savedRecord,
        isClimbSuccess,
        newFloor,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return { success: false, message: '抽奖失败: ' + error.message };
    } finally {
      await queryRunner.release();
    }
  }
}
