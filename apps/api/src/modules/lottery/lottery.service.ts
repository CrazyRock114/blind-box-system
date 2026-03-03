import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LotteryEngine, LotteryResult } from './lottery.engine';
import { LotteryRecord } from './lottery-record.entity';
import { BoxPool, BoxType } from '../box/box-pool.entity';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class LotteryService {
  constructor(
    @InjectRepository(LotteryRecord)
    private lotteryRepo: Repository<LotteryRecord>,
    @InjectRepository(BoxPool)
    private boxPoolRepo: Repository<BoxPool>,
    private lotteryEngine: LotteryEngine,
    private walletService: WalletService,
  ) {}

  /**
   * 执行抽奖
   */
  async draw(userId: string, boxPoolId: string, times: number = 1): Promise<LotteryResult[]> {
    const boxPool = await this.boxPoolRepo.findOne({ where: { id: boxPoolId } });
    
    if (!boxPool) {
      throw new ForbiddenException('盲盒不存在');
    }

    const totalCost = boxPool.price * times;
    
    // 检查余额
    const hasEnoughBalance = await this.walletService.checkBalance(
      userId,
      totalCost,
      boxPool.useLuckyCoin ? 'lucky_coin' : 'balance',
    );

    if (!hasEnoughBalance) {
      throw new ForbiddenException('余额不足');
    }

    const results: LotteryResult[] = [];

    for (let i = 0; i < times; i++) {
      // 扣除费用
      await this.walletService.deduct(
        userId,
        boxPool.price,
        boxPool.useLuckyCoin ? 'lucky_coin' : 'balance',
        'lottery' as any,
        boxPoolId,
      );

      let result: LotteryResult;

      switch (boxPool.type) {
        case BoxType.ICHIBAN:
          result = await this.lotteryEngine.ichibanLottery(userId, boxPoolId);
          break;
        case BoxType.TOWER:
          result = await this.lotteryEngine.towerLottery(userId, boxPoolId, 1);
          break;
        case BoxType.GASHAPON:
        case BoxType.NORMAL:
        default:
          result = await this.lotteryEngine.weightedLottery(userId, boxPoolId);
          break;
      }

      results.push(result);

      if (!result.success) {
        // 失败则退款
        await this.walletService.refund(
          userId,
          boxPool.price,
          boxPool.useLuckyCoin ? 'lucky_coin' : 'balance',
          result.record?.id,
        );
      }
    }

    return results;
  }

  /**
   * 获取用户抽奖历史
   */
  async getUserHistory(userId: string, page: number = 1, limit: number = 20) {
    const [records, total] = await this.lotteryRepo.findAndCount({
      where: { userId },
      relations: ['prize', 'boxPool'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: records,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
