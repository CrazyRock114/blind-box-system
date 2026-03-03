/**
 * 奖池配置服务单元测试
 * Phase 2 - 概率引擎测试
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PoolConfigService } from '../config/pool-config.service';
import { BoxPool, BoxType } from '../../box/box-pool.entity';
import { Prize, PrizeLevel, PrizeType } from '../../box/prize.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PoolRealtimeConfig, GuaranteeType } from '../guarantee/guarantee.types';

// Mock Redis Client
const mockRedisClient = {
  get: jest.fn(),
  setEx: jest.fn(),
  del: jest.fn(),
  mGet: jest.fn(),
  publish: jest.fn(),
};

describe('PoolConfigService', () => {
  let service: PoolConfigService;
  let boxPoolRepo: jest.Mocked<Repository<BoxPool>>;
  let prizeRepo: jest.Mocked<Repository<Prize>>;

  const mockBoxPool: Partial<BoxPool> = {
    id: 'pool-1',
    name: '测试奖池',
    type: BoxType.NORMAL,
    price: 10,
    status: 'active' as any,
  };

  const mockPrizes: Partial<Prize>[] = [
    {
      id: 'prize-1',
      boxPoolId: 'pool-1',
      name: '一等奖',
      level: PrizeLevel.A,
      type: PrizeType.GOODS,
      weight: 10,
      probability: 0.1,
      stock: 10,
      totalStock: 10,
      soldCount: 0,
    },
    {
      id: 'prize-2',
      boxPoolId: 'pool-1',
      name: '二等奖',
      level: PrizeLevel.B,
      type: PrizeType.GOODS,
      weight: 90,
      probability: 0.9,
      stock: 90,
      totalStock: 90,
      soldCount: 0,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PoolConfigService,
        {
          provide: getRepositoryToken(BoxPool),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Prize),
          useValue: {
            update: jest.fn(),
          },
        },
        {
          provide: 'REDIS_CLIENT',
          useValue: mockRedisClient,
        },
      ],
    }).compile();

    service = module.get<PoolConfigService>(PoolConfigService);
    boxPoolRepo = module.get(getRepositoryToken(BoxPool));
    prizeRepo = module.get(getRepositoryToken(Prize));

    jest.clearAllMocks();
  });

  describe('getPoolConfig', () => {
    it('应从缓存获取配置', async () => {
      const cachedConfig: PoolRealtimeConfig = {
        boxPoolId: 'pool-1',
        prizes: [],
        guarantees: [],
        algorithm: {
          algorithm: 'weighted',
          enableGuarantee: true,
          enableStockCheck: true,
          enableAudit: true,
        },
        version: 1,
        updatedAt: Date.now(),
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedConfig));

      const result = await service.getPoolConfig('pool-1');

      expect(result).toEqual(cachedConfig);
      expect(mockRedisClient.get).toHaveBeenCalledWith('lottery:pool:pool-1');
      expect(boxPoolRepo.findOne).not.toHaveBeenCalled();
    });

    it('应从数据库加载并缓存配置', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      boxPoolRepo.findOne.mockResolvedValue({
        ...mockBoxPool,
        prizes: mockPrizes as Prize[],
      } as BoxPool);

      const result = await service.getPoolConfig('pool-1');

      expect(result).not.toBeNull();
      expect(result?.boxPoolId).toBe('pool-1');
      expect(result?.prizes).toHaveLength(2);
      expect(mockRedisClient.setEx).toHaveBeenCalled();
    });

    it('应在奖池不存在时返回null', async () => {
      mockRedisClient.get.mockResolvedValue(null);
      boxPoolRepo.findOne.mockResolvedValue(null);

      const result = await service.getPoolConfig('pool-1');

      expect(result).toBeNull();
    });
  });

  describe('hotUpdatePoolConfig', () => {
    it('应成功热更新奖品配置', async () => {
      const initialConfig: PoolRealtimeConfig = {
        boxPoolId: 'pool-1',
        prizes: [
          {
            prizeId: 'prize-1',
            name: '一等奖',
            level: PrizeLevel.A,
            weight: 10,
            probability: 0.1,
            stock: 10,
            totalStock: 10,
            soldCount: 0,
          },
        ],
        guarantees: [],
        algorithm: {
          algorithm: 'weighted',
          enableGuarantee: true,
          enableStockCheck: true,
          enableAudit: true,
        },
        version: 1,
        updatedAt: Date.now(),
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(initialConfig));
      prizeRepo.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });

      const result = await service.hotUpdatePoolConfig({
        boxPoolId: 'pool-1',
        prizes: [
          { prizeId: 'prize-1', weight: 20, probability: 0.2 },
        ],
      });

      expect(result.version).toBe(2);
      expect(result.prizes[0].dynamicWeight).toBe(20);
      expect(result.prizes[0].probability).toBe(0.2);
      expect(prizeRepo.update).toHaveBeenCalledWith(
        { id: 'prize-1', boxPoolId: 'pool-1' },
        { weight: 20, probability: 0.2 }
      );
    });

    it('应在没有更新项时抛出错误', async () => {
      const initialConfig: PoolRealtimeConfig = {
        boxPoolId: 'pool-1',
        prizes: [],
        guarantees: [],
        algorithm: {
          algorithm: 'weighted',
          enableGuarantee: true,
          enableStockCheck: true,
          enableAudit: true,
        },
        version: 1,
        updatedAt: Date.now(),
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(initialConfig));

      await expect(service.hotUpdatePoolConfig({
        boxPoolId: 'pool-1',
      })).rejects.toThrow('奖池不存在');
    });
  });

  describe('validateConfig', () => {
    it('应验证权重总和大于0', () => {
      const validConfig: PoolRealtimeConfig = {
        boxPoolId: 'pool-1',
        prizes: [
          { prizeId: '1', name: 'P1', level: PrizeLevel.A, weight: 10, probability: 0.5, stock: 10, totalStock: 10, soldCount: 0 },
          { prizeId: '2', name: 'P2', level: PrizeLevel.B, weight: 10, probability: 0.5, stock: 10, totalStock: 10, soldCount: 0 },
        ],
        guarantees: [],
        algorithm: {
          algorithm: 'weighted',
          enableGuarantee: true,
          enableStockCheck: true,
          enableAudit: true,
        },
        version: 1,
        updatedAt: Date.now(),
      };

      const result = service.validateConfig(validConfig);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应检测权重总和为0', () => {
      const invalidConfig: PoolRealtimeConfig = {
        boxPoolId: 'pool-1',
        prizes: [
          { prizeId: '1', name: 'P1', level: PrizeLevel.A, weight: 0, probability: 0, stock: 10, totalStock: 10, soldCount: 0 },
        ],
        guarantees: [],
        algorithm: {
          algorithm: 'weighted',
          enableGuarantee: true,
          enableStockCheck: true,
          enableAudit: true,
        },
        version: 1,
        updatedAt: Date.now(),
      };

      const result = service.validateConfig(invalidConfig);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('奖品权重总和必须大于0');
    });

    it('应检测概率总和不为1', () => {
      const invalidConfig: PoolRealtimeConfig = {
        boxPoolId: 'pool-1',
        prizes: [
          { prizeId: '1', name: 'P1', level: PrizeLevel.A, weight: 10, probability: 0.5, stock: 10, totalStock: 10, soldCount: 0 },
          { prizeId: '2', name: 'P2', level: PrizeLevel.B, weight: 10, probability: 0.3, stock: 10, totalStock: 10, soldCount: 0 },
        ],
        guarantees: [],
        algorithm: {
          algorithm: 'weighted',
          enableGuarantee: true,
          enableStockCheck: true,
          enableAudit: true,
        },
        version: 1,
        updatedAt: Date.now(),
      };

      const result = service.validateConfig(invalidConfig);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('概率总和'))).toBe(true);
    });

    it('应检测保底阈值非法', () => {
      const invalidConfig: PoolRealtimeConfig = {
        boxPoolId: 'pool-1',
        prizes: [
          { prizeId: '1', name: 'P1', level: PrizeLevel.A, weight: 10, probability: 1, stock: 10, totalStock: 10, soldCount: 0 },
        ],
        guarantees: [
          {
            id: 'g1',
            boxPoolId: 'pool-1',
            type: GuaranteeType.CONSECUTIVE,
            threshold: 0,
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

      const result = service.validateConfig(invalidConfig);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('保底阈值必须大于0'))).toBe(true);
    });
  });

  describe('batchGetPoolConfig', () => {
    it('应批量获取奖池配置', async () => {
      const cachedConfig1: PoolRealtimeConfig = {
        boxPoolId: 'pool-1',
        prizes: [],
        guarantees: [],
        algorithm: {
          algorithm: 'weighted',
          enableGuarantee: true,
          enableStockCheck: true,
          enableAudit: true,
        },
        version: 1,
        updatedAt: Date.now(),
      };

      mockRedisClient.mGet.mockResolvedValue([
        JSON.stringify(cachedConfig1),
        null, // pool-2 需要数据库加载
      ]);

      boxPoolRepo.findOne.mockResolvedValue({
        ...mockBoxPool,
        id: 'pool-2',
        prizes: [],
      } as BoxPool);

      const results = await service.batchGetPoolConfig(['pool-1', 'pool-2']);

      expect(results.size).toBe(2);
      expect(results.has('pool-1')).toBe(true);
      expect(results.has('pool-2')).toBe(true);
    });
  });

  describe('refreshPoolConfig', () => {
    it('应刷新并重新加载配置', async () => {
      mockRedisClient.del.mockResolvedValue(1);
      boxPoolRepo.findOne.mockResolvedValue({
        ...mockBoxPool,
        prizes: mockPrizes as Prize[],
      } as BoxPool);

      const result = await service.refreshPoolConfig('pool-1');

      expect(mockRedisClient.del).toHaveBeenCalledWith('lottery:pool:pool-1');
      expect(result).not.toBeNull();
    });
  });
});
