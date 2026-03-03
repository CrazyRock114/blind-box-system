/**
 * Redis保底状态管理服务
 * Phase 2 - 保底机制核心实现
 */

import { Injectable, Inject } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { REDIS_CLIENT } from '../../../database/redis.module';
import { 
  UserGuaranteeState, 
  GuaranteeType, 
  GuaranteeConfig 
} from './guarantee.types';
import { PrizeLevel } from '../../box/prize.entity';

@Injectable()
export class GuaranteeRedisService {
  /** Redis Key前缀 */
  private readonly KEY_PREFIX = 'lottery:guarantee:';
  private readonly POOL_CONFIG_PREFIX = 'lottery:pool:';
  private readonly LOCK_PREFIX = 'lottery:lock:';

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: RedisClientType,
  ) {}

  /**
   * 获取用户保底状态Key
   */
  private getUserStateKey(userId: string, boxPoolId: string, type: GuaranteeType): string {
    return `${this.KEY_PREFIX}${type}:${boxPoolId}:${userId}`;
  }

  /**
   * 获取奖池锁Key（分布式锁）
   */
  private getLockKey(boxPoolId: string): string {
    return `${this.LOCK_PREFIX}${boxPoolId}`;
  }

  /**
   * 获取用户保底状态
   */
  async getUserState(
    userId: string, 
    boxPoolId: string, 
    type: GuaranteeType
  ): Promise<UserGuaranteeState | null> {
    const key = this.getUserStateKey(userId, boxPoolId, type);
    const data = await this.redis.get(key);
    
    if (!data || typeof data !== 'string') {
      // 初始化默认状态
      return {
        userId,
        boxPoolId,
        type,
        consecutiveCount: 0,
        levelCounts: type === GuaranteeType.LEVEL ? this.initLevelCounts() : undefined,
        lastDrawTime: Date.now(),
        triggered: false,
      };
    }

    return JSON.parse(data);
  }

  /**
   * 保存用户保底状态
   */
  async saveUserState(state: UserGuaranteeState, ttlSeconds: number = 86400 * 30): Promise<void> {
    const key = this.getUserStateKey(state.userId, state.boxPoolId, state.type);
    await this.redis.setEx(key, ttlSeconds, JSON.stringify(state));
  }

  /**
   * 增加连续未中奖计数
   */
  async incrementConsecutiveCount(
    userId: string, 
    boxPoolId: string, 
    type: GuaranteeType
  ): Promise<number> {
    const state = await this.getUserState(userId, boxPoolId, type);
    state.consecutiveCount += 1;
    state.lastDrawTime = Date.now();
    await this.saveUserState(state);
    return state.consecutiveCount;
  }

  /**
   * 重置连续未中奖计数
   */
  async resetConsecutiveCount(
    userId: string, 
    boxPoolId: string, 
    type: GuaranteeType
  ): Promise<void> {
    const state = await this.getUserState(userId, boxPoolId, type);
    state.consecutiveCount = 0;
    state.triggered = false;
    state.lastDrawTime = Date.now();
    await this.saveUserState(state);
  }

  /**
   * 增加指定等级的未中奖计数（层级保底）
   */
  async incrementLevelCount(
    userId: string, 
    boxPoolId: string, 
    level: PrizeLevel
  ): Promise<Record<PrizeLevel, number>> {
    const state = await this.getUserState(userId, boxPoolId, GuaranteeType.LEVEL);
    
    if (!state.levelCounts) {
      state.levelCounts = this.initLevelCounts();
    }
    
    state.levelCounts[level] = (state.levelCounts[level] || 0) + 1;
    state.lastDrawTime = Date.now();
    await this.saveUserState(state);
    
    return state.levelCounts;
  }

  /**
   * 重置指定等级的计数
   */
  async resetLevelCount(
    userId: string, 
    boxPoolId: string, 
    level: PrizeLevel
  ): Promise<void> {
    const state = await this.getUserState(userId, boxPoolId, GuaranteeType.LEVEL);
    
    if (state.levelCounts) {
      state.levelCounts[level] = 0;
    }
    
    state.lastDrawTime = Date.now();
    await this.saveUserState(state);
  }

  /**
   * 检查是否触发保底
   */
  async checkGuaranteeTriggered(
    userId: string, 
    boxPoolId: string, 
    config: GuaranteeConfig
  ): Promise<boolean> {
    const state = await this.getUserState(userId, boxPoolId, config.type);
    
    if (state.triggered) {
      return true; // 已经触发过
    }

    switch (config.type) {
      case GuaranteeType.CONSECUTIVE:
      case GuaranteeType.GLOBAL:
        return state.consecutiveCount >= config.threshold;
      
      case GuaranteeType.LEVEL:
        if (state.levelCounts) {
          return (state.levelCounts[config.guaranteeLevel] || 0) >= config.threshold;
        }
        return false;
      
      default:
        return false;
    }
  }

  /**
   * 标记保底已触发
   */
  async markGuaranteeTriggered(
    userId: string, 
    boxPoolId: string, 
    type: GuaranteeType
  ): Promise<void> {
    const state = await this.getUserState(userId, boxPoolId, type);
    state.triggered = true;
    await this.saveUserState(state);
  }

  /**
   * 获取分布式锁
   * @returns 锁标识（用于释放锁）
   */
  async acquireLock(boxPoolId: string, ttlSeconds: number = 10): Promise<string | null> {
    const lockKey = this.getLockKey(boxPoolId);
    const lockValue = `${Date.now()}-${Math.random()}`;
    
    // 使用 NX (Not Exists) 和 EX (Expire) 参数
    const result = await this.redis.set(lockKey, lockValue, {
      NX: true,
      EX: ttlSeconds,
    });
    
    return result ? lockValue : null;
  }

  /**
   * 释放分布式锁
   */
  async releaseLock(boxPoolId: string, lockValue: string): Promise<boolean> {
    const lockKey = this.getLockKey(boxPoolId);
    const currentValue = await this.redis.get(lockKey);
    
    // 只有锁的持有者才能释放
    if (currentValue === lockValue) {
      await this.redis.del(lockKey);
      return true;
    }
    
    return false;
  }

  /**
   * 批量获取用户保底状态（用于批量抽奖）
   */
  async batchGetUserStates(
    userId: string, 
    boxPoolId: string, 
    types: GuaranteeType[]
  ): Promise<Map<GuaranteeType, UserGuaranteeState>> {
    const keys = types.map(type => this.getUserStateKey(userId, boxPoolId, type));
    const values = await this.redis.mGet(keys);
    
    const result = new Map<GuaranteeType, UserGuaranteeState>();
    
    types.forEach((type, index) => {
      const data = values[index];
      if (data && typeof data === 'string') {
        result.set(type, JSON.parse(data));
      } else {
        // 初始化默认状态
        result.set(type, {
          userId,
          boxPoolId,
          type,
          consecutiveCount: 0,
          levelCounts: type === GuaranteeType.LEVEL ? this.initLevelCounts() : undefined,
          lastDrawTime: Date.now(),
          triggered: false,
        });
      }
    });
    
    return result;
  }

  /**
   * 清除用户保底状态（用于测试或重置）
   */
  async clearUserState(userId: string, boxPoolId: string, type: GuaranteeType): Promise<void> {
    const key = this.getUserStateKey(userId, boxPoolId, type);
    await this.redis.del(key);
  }

  /**
   * 初始化等级计数
   */
  private initLevelCounts(): Record<PrizeLevel, number> {
    return {
      [PrizeLevel.A]: 0,
      [PrizeLevel.B]: 0,
      [PrizeLevel.C]: 0,
      [PrizeLevel.D]: 0,
      [PrizeLevel.E]: 0,
      [PrizeLevel.F]: 0,
      [PrizeLevel.LAST]: 0,
      [PrizeLevel.NORMAL]: 0,
    };
  }

  /**
   * 获取奖池统计信息
   */
  async getPoolStats(boxPoolId: string): Promise<{
    totalDraws: number;
    guaranteeTriggers: number;
  }> {
    const drawsKey = `${this.POOL_CONFIG_PREFIX}${boxPoolId}:stats:draws`;
    const triggersKey = `${this.POOL_CONFIG_PREFIX}${boxPoolId}:stats:triggers`;
    
    const [draws, triggers] = await Promise.all([
      this.redis.get(drawsKey),
      this.redis.get(triggersKey),
    ]);
    
    return {
      totalDraws: parseInt((draws as string) || '0', 10),
      guaranteeTriggers: parseInt((triggers as string) || '0', 10),
    };
  }

  /**
   * 增加奖池统计
   */
  async incrementPoolStats(
    boxPoolId: string, 
    isGuaranteeTrigger: boolean
  ): Promise<void> {
    const drawsKey = `${this.POOL_CONFIG_PREFIX}${boxPoolId}:stats:draws`;
    const triggersKey = `${this.POOL_CONFIG_PREFIX}${boxPoolId}:stats:triggers`;
    
    await this.redis.incr(drawsKey);
    
    if (isGuaranteeTrigger) {
      await this.redis.incr(triggersKey);
    }
  }
}
