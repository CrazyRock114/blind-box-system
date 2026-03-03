/**
 * 保底机制类型定义
 * Phase 2 - 概率引擎核心类型
 */

import { PrizeLevel, Prize } from '../box/prize.entity';
import { LotteryRecord } from '../lottery-record.entity';

/**
 * 保底类型
 */
export enum GuaranteeType {
  /** 连续N次必中 */
  CONSECUTIVE = 'consecutive',
  /** 层级保底 - 按奖品等级独立计算 */
  LEVEL = 'level',
  /** 全局保底 - 大奖必出 */
  GLOBAL = 'global',
}

/**
 * 保底配置
 */
export interface GuaranteeConfig {
  id: string;
  boxPoolId: string;
  type: GuaranteeType;
  
  /** 触发保底所需的连续抽奖次数 */
  threshold: number;
  
  /** 保底奖品等级 */
  guaranteeLevel: PrizeLevel;
  
  /** 是否启用 */
  enabled: boolean;
  
  /** 优先级（数字越小优先级越高） */
  priority: number;
  
  /** 扩展配置 */
  metadata?: Record<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 用户保底状态（存储在Redis）
 */
export interface UserGuaranteeState {
  /** 用户ID */
  userId: string;
  
  /** 奖池ID */
  boxPoolId: string;
  
  /** 保底类型 */
  type: GuaranteeType;
  
  /** 连续未中奖次数 */
  consecutiveCount: number;
  
  /** 各等级未中奖计数（用于层级保底） */
  levelCounts?: Record<PrizeLevel, number>;
  
  /** 最后抽奖时间 */
  lastDrawTime: number;
  
  /** 本次保底是否已触发 */
  triggered: boolean;
}

/**
 * 抽奖上下文
 */
export interface DrawContext {
  userId: string;
  boxPoolId: string;
  drawTime: number;
  clientIp?: string;
  deviceId?: string;
}

/**
 * 抽奖算法配置
 */
export interface LotteryAlgorithmConfig {
  /** 算法类型 */
  algorithm: 'weighted' | 'fair' | 'predefined';
  
  /** 是否启用保底 */
  enableGuarantee: boolean;
  
  /** 是否启用库存实时校验 */
  enableStockCheck: boolean;
  
  /** 是否记录审计日志 */
  enableAudit: boolean;
  
  /** 预生成序列长度（可选） */
  sequenceLength?: number;
  
  /** 随机种子（用于可重现测试） */
  randomSeed?: string;
}

/**
 * 奖池实时配置（支持热更新）
 */
export interface PoolRealtimeConfig {
  boxPoolId: string;
  
  /** 奖品配置 */
  prizes: PrizeRealtimeConfig[];
  
  /** 保底配置 */
  guarantees: GuaranteeConfig[];
  
  /** 算法配置 */
  algorithm: LotteryAlgorithmConfig;
  
  /** 版本号（用于热更新检测） */
  version: number;
  
  /** 更新时间 */
  updatedAt: number;
}

/**
 * 奖品实时配置
 */
export interface PrizeRealtimeConfig {
  prizeId: string;
  name: string;
  level: PrizeLevel;
  weight: number;
  probability: number;
  stock: number;
  totalStock: number;
  soldCount: number;
  /** 动态调整的权重（热更新用） */
  dynamicWeight?: number;
}

/**
 * 抽奖结果
 */
export interface LotteryResult {
  success: boolean;
  prize?: Prize;
  record?: LotteryRecord;
  message?: string;
  guaranteeTriggered?: boolean;
}

/**
 * 抽奖审计记录
 */
export interface LotteryAuditRecord {
  id: string;
  userId: string;
  boxPoolId: string;
  prizeId: string | null;
  drawNumber: number;
  randomValue: number;
  algorithmVersion: number;
  guaranteeTriggered: boolean;
  stockBefore: number;
  stockAfter: number;
  timestamp: number;
  duration: number;
}

/**
 * 热更新配置DTO
 */
export interface HotUpdatePrizeDTO {
  prizeId: string;
  weight?: number;
  probability?: number;
  stock?: number;
}

export interface HotUpdatePoolDTO {
  boxPoolId: string;
  prizes?: HotUpdatePrizeDTO[];
  guarantees?: Partial<GuaranteeConfig>[];
  algorithm?: Partial<LotteryAlgorithmConfig>;
}
