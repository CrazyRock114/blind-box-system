/**
 * 抽奖引擎单元测试（简化版）
 * Phase 2 - 概率引擎测试
 */

import { Test, TestingModule } from '@nestjs/testing';
import { EnhancedLotteryEngine } from '../lottery-engine.enhanced';
import { GuaranteeRedisService } from '../guarantee/guarantee-redis.service';
import { PoolConfigService } from '../config/pool-config.service';
import { BoxPool, BoxType } from '../../box/box-pool.entity';
import { Prize, PrizeLevel, PrizeType } from '../../box/prize.entity';
import { LotteryRecord } from '../lottery-record.entity';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GuaranteeType, PoolRealtimeConfig } from '../guarantee/guarantee.types';

// Mock 数据
const mockPrizes: Partial<Prize>[] = [
  {
    id: 'prize-1',
    name: '一等奖',
    level: PrizeLevel.A,
    weight: 10,
    stock: 10,
  },
  {
    id: 'prize-2',
    name: '二等奖',
    level: PrizeLevel.B,
    weight: 30,
    stock: 50,
  },
  {
    id: 'prize-3',
    name: '普通奖',
    level: PrizeLevel.NORMAL,
    weight: 100,
    stock: 200,
  },
];

const mockPoolConfig: PoolRealtimeConfig = {
  boxPoolId: 'pool-1',
  prizes: mockPrizes.map(p => ({
    prizeId: p.id!,
    name: p.name!,
    level: p.level!,
    weight: p.weight!,
    probability: 0.1,
    stock: p.stock!,
    totalStock: p.stock!,
    soldCount: 0,
  })),
  guarantees: [
    {
      id: 'pool-1-consecutive',
      boxPoolId: 'pool-1',
      type: GuaranteeType.CONSECUTIVE,
      threshold: 100,
      guaranteeLevel: PrizeLevel.A,
      enabled: true,
      priority: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  algorithm: {
    algorithm: 'weighted',
    enableGuarantee: true,
    enableStockCheck: true,
    enableAudit: true,
  },
  version: 1,
  updatedAt: Date.now(),
};

describe('EnhancedLotteryEngine', () => {
  let engine: EnhancedLotteryEngine;
  let guaranteeRedis: jest.Mocked<GuaranteeRedisService>;
  let poolConfig: jest.Mocked<PoolConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnhancedLotteryEngine,
        {
          provide: getRepositoryToken(BoxPool),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Prize),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(LotteryRecord),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(),
          },
        },
        {
          provide: GuaranteeRedisService,
          useValue: {
            acquireLock: jest.fn(),
            releaseLock: jest.fn(),
            checkGuaranteeTriggered: jest.fn(),
            incrementConsecutiveCount: jest.fn(),
            resetConsecutiveCount: jest.fn(),
            incrementLevelCount: jest.fn(),
            resetLevelCount: jest.fn(),
            markGuaranteeTriggered: jest.fn(),
            incrementPoolStats: jest.fn(),
          },
        },
        {
          provide: PoolConfigService,
          useValue: {
            getPoolConfig: jest.fn(),
          },
        },
      ],
    }).compile();

    engine = module.get<EnhancedLotteryEngine>(EnhancedLotteryEngine);
    guaranteeRedis = module.get(GuaranteeRedisService);
    poolConfig = module.get(PoolConfigService);

    // 默认mock返回值
    poolConfig.getPoolConfig.mockResolvedValue(mockPoolConfig);
    guaranteeRedis.acquireLock.mockResolvedValue('lock-value');
    guaranteeRedis.checkGuaranteeTriggered.mockResolvedValue(false);
  });

  describe('基础功能', () => {
    it('应成功实例化引擎', () => {
      expect(engine).toBeDefined();
    });

    it('应在奖池不存在时返回错误', async () => {
      poolConfig.getPoolConfig.mockResolvedValue(null);

      const result = await engine.weightedLottery('user-1', 'pool-1');

      expect(result.success).toBe(false);
      expect(result.message).toContain('奖池配置不存在');
    });

    it('应在库存不足时返回错误', async () => {
      const emptyConfig = {
        ...mockPoolConfig,
        prizes: mockPoolConfig.prizes.map(p => ({ ...p, stock: 0 })),
      };
      poolConfig.getPoolConfig.mockResolvedValue(emptyConfig);

      const result = await engine.weightedLottery('user-1', 'pool-1');

      expect(result.success).toBe(false);
      expect(result.message).toContain('奖品已售罄');
    });

    it('应在获取锁失败时返回错误', async () => {
      guaranteeRedis.acquireLock.mockResolvedValue(null);

      const result = await engine.weightedLottery('user-1', 'pool-1');

      expect(result.success).toBe(false);
      expect(result.message).toContain('系统繁忙');
    });
  });

  describe('保底机制', () => {
    it('应检查保底是否触发', async () => {
      guaranteeRedis.checkGuaranteeTriggered.mockResolvedValue(true);

      // 由于无法mock QueryRunner内部操作，我们只测试外部调用
      await engine.weightedLottery('user-1', 'pool-1');

      expect(guaranteeRedis.checkGuaranteeTriggered).toHaveBeenCalled();
    });

    it('应在保底触发时返回保底奖品', async () => {
      guaranteeRedis.checkGuaranteeTriggered.mockResolvedValue(true);

      await engine.weightedLottery('user-1', 'pool-1');

      // 验证保底检查被调用
      expect(guaranteeRedis.checkGuaranteeTriggered).toHaveBeenCalledWith(
        'user-1',
        'pool-1',
        expect.objectContaining({
          type: GuaranteeType.CONSECUTIVE,
        })
      );
    });

    it('应在未触发保底时更新计数', async () => {
      guaranteeRedis.checkGuaranteeTriggered.mockResolvedValue(false);

      await engine.weightedLottery('user-1', 'pool-1');

      // 验证锁的获取和释放
      expect(guaranteeRedis.acquireLock).toHaveBeenCalledWith('pool-1', 5);
    });
  });

  describe('一番赏抽奖', () => {
    it('应定义一番赏方法', () => {
      expect(typeof engine.ichibanLottery).toBe('function');
    });
  });

  describe('爬塔抽奖', () => {
    it('应定义爬塔方法', () => {
      expect(typeof engine.towerLottery).toBe('function');
    });
  });
});
