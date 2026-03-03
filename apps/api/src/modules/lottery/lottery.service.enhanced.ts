/**
 * 增强版抽奖服务
 * Phase 2 - 概率引擎核心服务
 */

import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnhancedLotteryEngine, LotteryResult } from './lottery-engine.enhanced';
import { LotteryRecord, LotteryType } from './lottery-record.entity';
import { BoxPool, BoxType } from '../box/box-pool.entity';
import { WalletService } from '../wallet/wallet.service';
import { GuaranteeRedisService } from './guarantee/guarantee-redis.service';
import { GuaranteeType } from './guarantee/guarantee.types';

@Injectable()
export class EnhancedLotteryService {
  private readonly logger = new Logger(EnhancedLotteryService.name);

  constructor(
    @InjectRepository(LotteryRecord)
    private lotteryRepo: Repository<LotteryRecord>,
    @InjectRepository(BoxPool)
    private boxPoolRepo: Repository<BoxPool>,
    private lotteryEngine: EnhancedLotteryEngine,
    private walletService: WalletService,
    private guaranteeRedis: GuaranteeRedisService,
  ) {}

  /**
   * 执行抽奖（增强版）
   * 
   * @param userId 用户ID
   * @param boxPoolId 奖池ID
   * @param times 抽奖次数
   * @param options 额外选项
   * @returns 抽奖结果数组
   */
  async draw(
    userId: string, 
    boxPoolId: string, 
    times: number = 1,
    options?: {
      clientIp?: string;
      deviceId?: string;
      skipBalanceCheck?: boolean;
    }
  ): Promise<LotteryResult[]> {
    // 1. 获取奖池信息
    const boxPool = await this.boxPoolRepo.findOne({ where: { id: boxPoolId } });
    
    if (!boxPool) {
      throw new ForbiddenException('盲盒不存在');
    }

    if (boxPool.status !== 'active') {
      throw new ForbiddenException('盲盒未上架或已停售');
    }

    const totalCost = boxPool.price * times;
    
    // 2. 检查余额
    if (!options?.skipBalanceCheck) {
      const hasEnoughBalance = await this.walletService.checkBalance(
        userId,
        totalCost,
        boxPool.useLuckyCoin ? 'lucky_coin' : 'balance',
      );

      if (!hasEnoughBalance) {
        throw new ForbiddenException('余额不足');
      }
    }

    const results: LotteryResult[] = [];

    for (let i = 0; i < times; i++) {
      // 3. 扣除费用
      await this.walletService.deduct(
        userId,
        boxPool.price,
        boxPool.useLuckyCoin ? 'lucky_coin' : 'balance',
        'lottery' as any,
        boxPoolId,
      );

      let result: LotteryResult;

      try {
        // 4. 执行抽奖
        switch (boxPool.type) {
          case BoxType.ICHIBAN:
            result = await this.lotteryEngine.ichibanLottery(userId, boxPoolId, {
              clientIp: options?.clientIp,
              deviceId: options?.deviceId,
            });
            break;
          
          case BoxType.TOWER:
            // 爬塔需要从用户状态获取当前层数
            const currentFloor = await this.getUserCurrentFloor(userId, boxPoolId);
            result = await this.lotteryEngine.towerLottery(
              userId, 
              boxPoolId, 
              currentFloor,
              {
                clientIp: options?.clientIp,
                deviceId: options?.deviceId,
              }
            );
            break;
          
          case BoxType.GASHAPON:
          case BoxType.NORMAL:
          default:
            result = await this.lotteryEngine.weightedLottery(userId, boxPoolId, {
              clientIp: options?.clientIp,
              deviceId: options?.deviceId,
            });
            break;
        }

        // 5. 更新抽奖记录的成本信息
        if (result.record) {
          result.record.costAmount = boxPool.price;
          result.record.costType = boxPool.useLuckyCoin ? 'lucky_coin' : 'balance';
          await this.lotteryRepo.save(result.record);
        }

        results.push(result);

        // 6. 失败则退款
        if (!result.success) {
          this.logger.warn(`抽奖失败，执行退款: ${userId}, ${result.message}`);
          await this.walletService.refund(
            userId,
            boxPool.price,
            boxPool.useLuckyCoin ? 'lucky_coin' : 'balance',
            result.record?.id,
          );
        }
      } catch (error) {
        this.logger.error(`抽奖异常: ${error.message}`, error.stack);
        
        // 异常时退款
        await this.walletService.refund(
          userId,
          boxPool.price,
          boxPool.useLuckyCoin ? 'lucky_coin' : 'balance',
        );

        results.push({
          success: false,
          message: '系统异常，已退款',
        });
      }
    }

    return results;
  }

  /**
   * 快速抽奖（用于批量/五连抽）
   */
  async quickDraw(
    userId: string,
    boxPoolId: string,
    times: number = 5,
  ): Promise<{
    results: LotteryResult[];
    summary: {
      total: number;
      success: number;
      guaranteeTriggers: number;
      totalCost: number;
    };
  }> {
    const results = await this.draw(userId, boxPoolId, times);

    const boxPool = await this.boxPoolRepo.findOne({
      where: { id: boxPoolId },
      select: ['price'],
    });

    const summary = {
      total: results.length,
      success: results.filter(r => r.success).length,
      guaranteeTriggers: results.filter(r => r.guaranteeTriggered).length,
      totalCost: (boxPool?.price || 0) * results.filter(r => r.success).length,
    };

    return { results, summary };
  }

  /**
   * 获取用户抽奖历史
   */
  async getUserHistory(
    userId: string, 
    page: number = 1, 
    limit: number = 20,
    filters?: {
      boxPoolId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    const where: any = { userId };

    if (filters?.boxPoolId) {
      where.boxPoolId = filters.boxPoolId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const [records, total] = await this.lotteryRepo.findAndCount({
      where,
      relations: ['prize', 'boxPool'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // 解析metadata
    const recordsWithMeta = records.map(record => ({
      ...record,
      metadata: record.metadata ? JSON.parse(record.metadata) : null,
    }));

    return {
      data: recordsWithMeta,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取用户保底状态
   */
  async getUserGuaranteeStatus(userId: string, boxPoolId: string) {
    const boxPool = await this.boxPoolRepo.findOne({
      where: { id: boxPoolId },
      select: ['id', 'name', 'type'],
    });

    if (!boxPool) {
      throw new ForbiddenException('奖池不存在');
    }

    // 获取保底状态
    const guaranteeStates = await this.guaranteeRedis.batchGetUserStates(
      userId,
      boxPoolId,
      [GuaranteeType.CONSECUTIVE, GuaranteeType.LEVEL, GuaranteeType.GLOBAL]
    );

    // 获取奖池配置
    const stats = await this.guaranteeRedis.getPoolStats(boxPoolId);

    return {
      boxPool,
      guaranteeStates: Object.fromEntries(guaranteeStates),
      stats,
    };
  }

  /**
   * 模拟抽奖（用于测试概率）
   */
  async simulateDraw(
    boxPoolId: string,
    times: number = 1000,
  ): Promise<{
    total: number;
    prizeDistribution: Record<string, {
      count: number;
      percentage: number;
      expected: number;
    }>;
    guaranteeTriggerRate: number;
  }> {
    const boxPool = await this.boxPoolRepo.findOne({
      where: { id: boxPoolId },
      relations: ['prizes'],
    });

    if (!boxPool) {
      throw new ForbiddenException('奖池不存在');
    }

    const distribution: Record<string, { count: number; percentage: number; expected: number }> = {};
    
    // 初始化分布统计
    boxPool.prizes.forEach(prize => {
      distribution[prize.id] = {
        count: 0,
        percentage: 0,
        expected: parseFloat(prize.probability.toString()) * 100,
      };
    });

    let guaranteeTriggers = 0;

    // 执行模拟抽奖
    for (let i = 0; i < times; i++) {
      const availablePrizes = boxPool.prizes.filter(p => p.stock > 0 || p.totalStock === 0);
      
      if (availablePrizes.length === 0) continue;

      const totalWeight = availablePrizes.reduce((sum, p) => sum + p.weight, 0);
      let random = Math.random() * totalWeight;
      let selectedPrize = availablePrizes[availablePrizes.length - 1];

      for (const prize of availablePrizes) {
        if (random < prize.weight) {
          selectedPrize = prize;
          break;
        }
        random -= prize.weight;
      }

      distribution[selectedPrize.id].count++;
    }

    // 计算百分比
    Object.keys(distribution).forEach(key => {
      distribution[key].percentage = (distribution[key].count / times) * 100;
    });

    return {
      total: times,
      prizeDistribution: distribution,
      guaranteeTriggerRate: (guaranteeTriggers / times) * 100,
    };
  }

  /**
   * 获取用户当前爬塔层数
   */
  private async getUserCurrentFloor(userId: string, boxPoolId: string): Promise<number> {
    // 从最后一次爬塔记录获取层数
    const lastRecord = await this.lotteryRepo.findOne({
      where: { 
        userId, 
        boxPoolId,
        type: LotteryType.TOWER,
      },
      order: { createdAt: 'DESC' },
    });

    if (!lastRecord) {
      return 1; // 从第一层开始
    }

    // 解析metadata获取新层数
    if (lastRecord.metadata) {
      const meta = JSON.parse(lastRecord.metadata);
      return meta.newFloor || 1;
    }

    return 1;
  }
}
