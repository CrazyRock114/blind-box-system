/**
 * 保底Redis服务单元测试
 * Phase 2 - 概率引擎测试
 */

import { Test, TestingModule } from '@nestjs/testing';
import { GuaranteeRedisService } from '../guarantee/guarantee-redis.service';
import { GuaranteeType, UserGuaranteeState } from '../guarantee/guarantee.types';
import { PrizeLevel } from '../../box/prize.entity';

// Mock Redis Client
const mockRedisClient = {
  get: jest.fn(),
  setEx: jest.fn(),
  del: jest.fn(),
  mGet: jest.fn(),
  set: jest.fn(),
  incr: jest.fn(),
};

describe('GuaranteeRedisService', () => {
  let service: GuaranteeRedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuaranteeRedisService,
        {
          provide: 'REDIS_CLIENT',
          useValue: mockRedisClient,
        },
      ],
    }).compile();

    service = module.get<GuaranteeRedisService>(GuaranteeRedisService);
    jest.clearAllMocks();
  });

  describe('getUserState', () => {
    it('应返回已存在的用户状态', async () => {
      const mockState: UserGuaranteeState = {
        userId: 'user-1',
        boxPoolId: 'pool-1',
        type: GuaranteeType.CONSECUTIVE,
        consecutiveCount: 5,
        lastDrawTime: Date.now(),
        triggered: false,
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(mockState));

      const result = await service.getUserState('user-1', 'pool-1', GuaranteeType.CONSECUTIVE);

      expect(result).toEqual(mockState);
      expect(mockRedisClient.get).toHaveBeenCalledWith('lottery:guarantee:consecutive:pool-1:user-1');
    });

    it('应初始化默认状态当记录不存在时', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await service.getUserState('user-1', 'pool-1', GuaranteeType.CONSECUTIVE);

      expect(result).toMatchObject({
        userId: 'user-1',
        boxPoolId: 'pool-1',
        type: GuaranteeType.CONSECUTIVE,
        consecutiveCount: 0,
        triggered: false,
      });
    });
  });

  describe('incrementConsecutiveCount', () => {
    it('应正确增加连续计数', async () => {
      const initialState: UserGuaranteeState = {
        userId: 'user-1',
        boxPoolId: 'pool-1',
        type: GuaranteeType.CONSECUTIVE,
        consecutiveCount: 3,
        lastDrawTime: Date.now(),
        triggered: false,
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(initialState));

      const result = await service.incrementConsecutiveCount('user-1', 'pool-1', GuaranteeType.CONSECUTIVE);

      expect(result).toBe(4);
      expect(mockRedisClient.setEx).toHaveBeenCalled();
    });
  });

  describe('checkGuaranteeTriggered', () => {
    it('应在达到阈值时触发保底', async () => {
      const state: UserGuaranteeState = {
        userId: 'user-1',
        boxPoolId: 'pool-1',
        type: GuaranteeType.CONSECUTIVE,
        consecutiveCount: 100,
        lastDrawTime: Date.now(),
        triggered: false,
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(state));

      const config = {
        id: 'config-1',
        boxPoolId: 'pool-1',
        type: GuaranteeType.CONSECUTIVE,
        threshold: 100,
        guaranteeLevel: PrizeLevel.A,
        enabled: true,
        priority: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await service.checkGuaranteeTriggered('user-1', 'pool-1', config);

      expect(result).toBe(true);
    });

    it('应在未达阈值时不触发保底', async () => {
      const state: UserGuaranteeState = {
        userId: 'user-1',
        boxPoolId: 'pool-1',
        type: GuaranteeType.CONSECUTIVE,
        consecutiveCount: 50,
        lastDrawTime: Date.now(),
        triggered: false,
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(state));

      const config = {
        id: 'config-1',
        boxPoolId: 'pool-1',
        type: GuaranteeType.CONSECUTIVE,
        threshold: 100,
        guaranteeLevel: PrizeLevel.A,
        enabled: true,
        priority: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await service.checkGuaranteeTriggered('user-1', 'pool-1', config);

      expect(result).toBe(false);
    });
  });

  describe('分布式锁', () => {
    it('应成功获取锁', async () => {
      mockRedisClient.set.mockResolvedValue('OK');

      const lockValue = await service.acquireLock('pool-1', 10);

      expect(lockValue).not.toBeNull();
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'lottery:lock:pool-1',
        expect.any(String),
        { NX: true, EX: 10 }
      );
    });

    it('应在锁已被持有时返回null', async () => {
      mockRedisClient.set.mockResolvedValue(null);

      const lockValue = await service.acquireLock('pool-1', 10);

      expect(lockValue).toBeNull();
    });

    it('应成功释放锁', async () => {
      mockRedisClient.get.mockResolvedValue('lock-value-123');
      mockRedisClient.del.mockResolvedValue(1);

      const result = await service.releaseLock('pool-1', 'lock-value-123');

      expect(result).toBe(true);
    });

    it('不应释放不属于当前持有者的锁', async () => {
      mockRedisClient.get.mockResolvedValue('different-value');

      const result = await service.releaseLock('pool-1', 'lock-value-123');

      expect(result).toBe(false);
    });
  });

  describe('层级保底计数', () => {
    it('应正确增加特定等级的计数', async () => {
      const initialState: UserGuaranteeState = {
        userId: 'user-1',
        boxPoolId: 'pool-1',
        type: GuaranteeType.LEVEL,
        consecutiveCount: 0,
        levelCounts: {
          [PrizeLevel.A]: 10,
          [PrizeLevel.B]: 5,
          [PrizeLevel.C]: 0,
          [PrizeLevel.D]: 0,
          [PrizeLevel.E]: 0,
          [PrizeLevel.F]: 0,
          [PrizeLevel.LAST]: 0,
          [PrizeLevel.NORMAL]: 0,
        },
        lastDrawTime: Date.now(),
        triggered: false,
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(initialState));

      const result = await service.incrementLevelCount('user-1', 'pool-1', PrizeLevel.A);

      expect(result[PrizeLevel.A]).toBe(11);
    });
  });
});
