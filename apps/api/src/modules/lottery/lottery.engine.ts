import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Prize, PrizeLevel } from '../box/prize.entity';
import { BoxPool, BoxType } from '../box/box-pool.entity';
import { LotteryRecord, LotteryType, LotteryStatus } from './lottery-record.entity';

export interface LotteryResult {
  success: boolean;
  prize?: Prize;
  record?: LotteryRecord;
  message?: string;
}

@Injectable()
export class LotteryEngine {
  constructor(
    @InjectRepository(BoxPool)
    private boxPoolRepo: Repository<BoxPool>,
    @InjectRepository(Prize)
    private prizeRepo: Repository<Prize>,
    @InjectRepository(LotteryRecord)
    private lotteryRepo: Repository<LotteryRecord>,
    private dataSource: DataSource,
  ) {}

  /**
   * 权重抽奖算法 - 适用于普通盲盒和扭蛋机
   */
  async weightedLottery(
    userId: string,
    boxPoolId: string,
  ): Promise<LotteryResult> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const boxPool = await queryRunner.manager.findOne(BoxPool, {
        where: { id: boxPoolId },
        relations: ['prizes'],
      });

      if (!boxPool) {
        return { success: false, message: '盲盒不存在' };
      }

      if (boxPool.status !== 'active') {
        return { success: false, message: '盲盒未上架' };
      }

      // 获取有库存的奖品
      const availablePrizes = boxPool.prizes.filter(p => p.stock > 0);
      if (availablePrizes.length === 0) {
        return { success: false, message: '奖品已售罄' };
      }

      // 权重抽奖
      const totalWeight = availablePrizes.reduce((sum, p) => sum + p.weight, 0);
      let random = Math.random() * totalWeight;
      let selectedPrize: Prize | null = null;

      for (const prize of availablePrizes) {
        if (random < prize.weight) {
          selectedPrize = prize;
          break;
        }
        random -= prize.weight;
      }

      if (!selectedPrize) {
        selectedPrize = availablePrizes[availablePrizes.length - 1];
      }

      // 扣除库存
      await queryRunner.manager.decrement(
        Prize,
        { id: selectedPrize.id },
        'stock',
        1,
      );

      await queryRunner.manager.increment(
        Prize,
        { id: selectedPrize.id },
        'soldCount',
        1,
      );

      // 创建抽奖记录
      const record = queryRunner.manager.create(LotteryRecord, {
        userId,
        boxPoolId,
        prizeId: selectedPrize.id,
        type: boxPool.type === BoxType.GASHAPON ? LotteryType.GASHAPON : LotteryType.NORMAL,
        costAmount: boxPool.price,
        costType: boxPool.useLuckyCoin ? 'lucky_coin' : 'balance',
        status: LotteryStatus.SUCCESS,
      });

      const savedRecord = await queryRunner.manager.save(record);
      await queryRunner.commitTransaction();

      return {
        success: true,
        prize: selectedPrize,
        record: savedRecord,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return { success: false, message: '抽奖失败: ' + error.message };
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 一番赏抽奖 - 固定奖池，随机抽取剩余奖品
   */
  async ichibanLottery(
    userId: string,
    boxPoolId: string,
  ): Promise<LotteryResult> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const boxPool = await queryRunner.manager.findOne(BoxPool, {
        where: { id: boxPoolId, type: BoxType.ICHIBAN },
        relations: ['prizes'],
      });

      if (!boxPool) {
        return { success: false, message: '一番赏不存在' };
      }

      if (boxPool.soldTickets >= boxPool.totalTickets) {
        return { success: false, message: '该套一番赏已售罄' };
      }

      // 判断是否Last赏
      const isLastTicket = boxPool.soldTickets + 1 === boxPool.totalTickets;

      let selectedPrize: Prize;

      if (isLastTicket && boxPool.lastPrizeId) {
        // Last赏
        selectedPrize = boxPool.prizes.find(p => p.id === boxPool.lastPrizeId);
      } else {
        // 随机抽取剩余奖品
        const availablePrizes = boxPool.prizes.filter(p => p.stock > 0);
        if (availablePrizes.length === 0) {
          return { success: false, message: '奖品已售罄' };
        }

        const randomIndex = Math.floor(Math.random() * availablePrizes.length);
        selectedPrize = availablePrizes[randomIndex];
      }

      // 扣除库存和增加售出计数
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
      });

      const savedRecord = await queryRunner.manager.save(record);
      await queryRunner.commitTransaction();

      return {
        success: true,
        prize: selectedPrize,
        record: savedRecord,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return { success: false, message: '抽奖失败: ' + error.message };
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 爬塔抽奖 - 逐层挑战
   */
  async towerLottery(
    userId: string,
    boxPoolId: string,
    currentFloor: number,
  ): Promise<LotteryResult & { isClimbSuccess?: boolean; newFloor?: number }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const boxPool = await queryRunner.manager.findOne(BoxPool, {
        where: { id: boxPoolId, type: BoxType.TOWER },
        relations: ['prizes'],
      });

      if (!boxPool) {
        return { success: false, message: '爬塔不存在' };
      }

      // 获取当前层对应的奖品
      const floorPrizes = boxPool.prizes.filter(p => p.stock > 0);
      if (floorPrizes.length === 0) {
        return { success: false, message: '奖品已售罄' };
      }

      // 根据层数计算成功率 (越高层越难)
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
