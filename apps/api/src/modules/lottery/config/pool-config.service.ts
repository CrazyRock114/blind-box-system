/**
 * 奖池配置服务 - 支持热更新
 * Phase 2 - 概率引擎核心实现
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisClientType } from 'redis';
import { Inject } from '@nestjs/common';
import { REDIS_CLIENT } from '../../../database/redis.module';
import { BoxPool } from '../../box/box-pool.entity';
import { Prize, PrizeLevel } from '../../box/prize.entity';
import { 
  PoolRealtimeConfig, 
  PrizeRealtimeConfig, 
  GuaranteeConfig,
  LotteryAlgorithmConfig,
  HotUpdatePoolDTO,
  HotUpdatePrizeDTO,
  GuaranteeType,
} from '../guarantee/guarantee.types';

@Injectable()
export class PoolConfigService {
  private readonly logger = new Logger(PoolConfigService.name);
  private readonly CACHE_PREFIX = 'lottery:pool:';
  private readonly CONFIG_TTL = 3600; // 1小时

  constructor(
    @InjectRepository(BoxPool)
    private boxPoolRepo: Repository<BoxPool>,
    @InjectRepository(Prize)
    private prizeRepo: Repository<Prize>,
    @Inject(REDIS_CLIENT) private readonly redis: RedisClientType,
  ) {}

  /**
   * 获取奖池配置（优先从Redis缓存）
   */
  async getPoolConfig(boxPoolId: string): Promise<PoolRealtimeConfig | null> {
    // 1. 先尝试从Redis获取
    const cached = await this.getCachedConfig(boxPoolId);
    if (cached) {
      this.logger.debug(`从缓存获取奖池配置: ${boxPoolId}`);
      return cached;
    }

    // 2. 从数据库加载并缓存
    const config = await this.loadConfigFromDatabase(boxPoolId);
    if (config) {
      await this.cacheConfig(config);
    }

    return config;
  }

  /**
   * 批量获取奖池配置
   */
  async batchGetPoolConfig(boxPoolIds: string[]): Promise<Map<string, PoolRealtimeConfig>> {
    const result = new Map<string, PoolRealtimeConfig>();
    
    // 批量从Redis获取
    const keys = boxPoolIds.map(id => this.getCacheKey(id));
    const cachedValues = await this.redis.mGet(keys);
    
    const missingIds: string[] = [];
    
    boxPoolIds.forEach((id, index) => {
      const cached = cachedValues[index];
      if (cached && typeof cached === 'string') {
        result.set(id, JSON.parse(cached));
      } else {
        missingIds.push(id);
      }
    });
    
    // 从数据库加载缺失的配置
    if (missingIds.length > 0) {
      const configs = await Promise.all(
        missingIds.map(id => this.loadConfigFromDatabase(id))
      );
      
      configs.forEach((config, index) => {
        if (config) {
          result.set(missingIds[index], config);
          this.cacheConfig(config);
        }
      });
    }
    
    return result;
  }

  /**
   * 热更新奖池配置
   */
  async hotUpdatePoolConfig(dto: HotUpdatePoolDTO): Promise<PoolRealtimeConfig> {
    const { boxPoolId, prizes, guarantees, algorithm } = dto;
    
    this.logger.log(`开始热更新奖池配置: ${boxPoolId}`);

    // 1. 获取当前配置
    let currentConfig = await this.getPoolConfig(boxPoolId);
    
    if (!currentConfig) {
      currentConfig = await this.loadConfigFromDatabase(boxPoolId);
      if (!currentConfig) {
        throw new Error(`奖池不存在: ${boxPoolId}`);
      }
    }

    // 2. 更新奖品配置
    if (prizes && prizes.length > 0) {
      await this.updatePrizeConfigs(boxPoolId, prizes);
      
      // 更新内存中的配置
      prizes.forEach(update => {
        const prize = currentConfig!.prizes.find(p => p.prizeId === update.prizeId);
        if (prize) {
          if (update.weight !== undefined) prize.dynamicWeight = update.weight;
          if (update.probability !== undefined) prize.probability = update.probability;
          if (update.stock !== undefined) prize.stock = update.stock;
        }
      });
    }

    // 3. 更新保底配置
    if (guarantees && guarantees.length > 0) {
      await this.updateGuaranteeConfigs(boxPoolId, guarantees);
      
      // 更新内存中的配置
      guarantees.forEach(update => {
        const idx = currentConfig!.guarantees.findIndex(g => g.id === update.id);
        if (idx >= 0) {
          currentConfig!.guarantees[idx] = { ...currentConfig!.guarantees[idx], ...update } as GuaranteeConfig;
        }
      });
    }

    // 4. 更新算法配置
    if (algorithm) {
      currentConfig!.algorithm = { ...currentConfig!.algorithm, ...algorithm };
    }

    // 5. 更新版本号和时间
    currentConfig!.version += 1;
    currentConfig!.updatedAt = Date.now();

    // 6. 刷新缓存
    await this.cacheConfig(currentConfig!);
    
    // 7. 发布更新通知（用于集群同步）
    await this.publishConfigUpdate(boxPoolId, currentConfig!.version);

    this.logger.log(`热更新完成: ${boxPoolId}, 新版本: ${currentConfig!.version}`);
    
    return currentConfig!;
  }

  /**
   * 刷新奖池配置（从数据库重新加载）
   */
  async refreshPoolConfig(boxPoolId: string): Promise<PoolRealtimeConfig | null> {
    this.logger.log(`刷新奖池配置: ${boxPoolId}`);
    
    // 清除缓存
    await this.clearCache(boxPoolId);
    
    // 重新加载
    const config = await this.loadConfigFromDatabase(boxPoolId);
    if (config) {
      await this.cacheConfig(config);
    }
    
    return config;
  }

  /**
   * 批量刷新配置
   */
  async batchRefreshConfig(boxPoolIds: string[]): Promise<void> {
    await Promise.all(boxPoolIds.map(id => this.refreshPoolConfig(id)));
  }

  /**
   * 从数据库加载配置
   */
  private async loadConfigFromDatabase(boxPoolId: string): Promise<PoolRealtimeConfig | null> {
    const boxPool = await this.boxPoolRepo.findOne({
      where: { id: boxPoolId },
      relations: ['prizes'],
    });

    if (!boxPool) {
      return null;
    }

    const prizeConfigs: PrizeRealtimeConfig[] = boxPool.prizes.map(prize => ({
      prizeId: prize.id,
      name: prize.name,
      level: prize.level,
      weight: prize.weight,
      probability: parseFloat(prize.probability.toString()),
      stock: prize.stock,
      totalStock: prize.totalStock,
      soldCount: prize.soldCount,
    }));

    // 加载保底配置（从系统配置表或默认配置）
    const guaranteeConfigs = await this.loadGuaranteeConfigs(boxPoolId);

    // 默认算法配置
    const algorithmConfig: LotteryAlgorithmConfig = {
      algorithm: 'weighted',
      enableGuarantee: true,
      enableStockCheck: true,
      enableAudit: true,
    };

    return {
      boxPoolId,
      prizes: prizeConfigs,
      guarantees: guaranteeConfigs,
      algorithm: algorithmConfig,
      version: 1,
      updatedAt: Date.now(),
    };
  }

  /**
   * 加载保底配置
   */
  private async loadGuaranteeConfigs(boxPoolId: string): Promise<GuaranteeConfig[]> {
    // 这里可以从数据库表加载，也可以使用默认配置
    // 暂时使用默认配置作为示例
    const defaultConfigs: GuaranteeConfig[] = [
      {
        id: `${boxPoolId}-consecutive`,
        boxPoolId,
        type: GuaranteeType.CONSECUTIVE,
        threshold: 100,
        guaranteeLevel: PrizeLevel.A,
        enabled: true,
        priority: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `${boxPoolId}-level-a`,
        boxPoolId,
        type: GuaranteeType.LEVEL,
        threshold: 50,
        guaranteeLevel: PrizeLevel.A,
        enabled: true,
        priority: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return defaultConfigs;
  }

  /**
   * 从缓存获取配置
   */
  private async getCachedConfig(boxPoolId: string): Promise<PoolRealtimeConfig | null> {
    const key = this.getCacheKey(boxPoolId);
    const data = await this.redis.get(key);
    return data && typeof data === 'string' ? JSON.parse(data) : null;
  }

  /**
   * 缓存配置
   */
  private async cacheConfig(config: PoolRealtimeConfig): Promise<void> {
    const key = this.getCacheKey(config.boxPoolId);
    await this.redis.setEx(key, this.CONFIG_TTL, JSON.stringify(config));
  }

  /**
   * 清除缓存
   */
  private async clearCache(boxPoolId: string): Promise<void> {
    const key = this.getCacheKey(boxPoolId);
    await this.redis.del(key);
  }

  /**
   * 获取缓存Key
   */
  private getCacheKey(boxPoolId: string): string {
    return `${this.CACHE_PREFIX}${boxPoolId}`;
  }

  /**
   * 更新奖品配置到数据库
   */
  private async updatePrizeConfigs(
    boxPoolId: string, 
    updates: HotUpdatePrizeDTO[]
  ): Promise<void> {
    for (const update of updates) {
      const updateData: any = {};
      if (update.weight !== undefined) updateData.weight = update.weight;
      if (update.probability !== undefined) updateData.probability = update.probability;
      if (update.stock !== undefined) updateData.stock = update.stock;

      if (Object.keys(updateData).length > 0) {
        await this.prizeRepo.update(
          { id: update.prizeId, boxPoolId },
          updateData
        );
      }
    }
  }

  /**
   * 更新保底配置
   */
  private async updateGuaranteeConfigs(
    boxPoolId: string,
    updates: Partial<GuaranteeConfig>[]
  ): Promise<void> {
    // 这里可以更新数据库中的保底配置表
    // 暂时只更新Redis缓存
    this.logger.debug(`更新保底配置: ${boxPoolId}, ${updates.length}条`);
  }

  /**
   * 发布配置更新通知
   */
  private async publishConfigUpdate(boxPoolId: string, version: number): Promise<void> {
    const channel = 'lottery:config:update';
    const message = JSON.stringify({ boxPoolId, version, timestamp: Date.now() });
    await this.redis.publish(channel, message);
  }

  /**
   * 获取所有活跃奖池ID
   */
  async getActivePoolIds(): Promise<string[]> {
    const pools = await this.boxPoolRepo.find({
      where: { status: 'active' as any },
      select: ['id'],
    });
    return pools.map(p => p.id);
  }

  /**
   * 验证配置合法性
   */
  validateConfig(config: PoolRealtimeConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. 验证奖品权重总和
    const totalWeight = config.prizes.reduce((sum, p) => sum + (p.dynamicWeight || p.weight), 0);
    if (totalWeight <= 0) {
      errors.push('奖品权重总和必须大于0');
    }

    // 2. 验证概率总和
    const totalProbability = config.prizes.reduce((sum, p) => sum + p.probability, 0);
    if (Math.abs(totalProbability - 1) > 0.001 && totalProbability !== 0) {
      errors.push(`奖品概率总和应为1，当前为${totalProbability}`);
    }

    // 3. 验证保底配置
    config.guarantees.forEach(g => {
      if (g.threshold <= 0) {
        errors.push(`保底阈值必须大于0: ${g.id}`);
      }
    });

    return { valid: errors.length === 0, errors };
  }
}
