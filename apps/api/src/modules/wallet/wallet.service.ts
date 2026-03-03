import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction, TransactionType, CurrencyType } from './transaction.entity';
import { User } from '../user/user.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private dataSource: DataSource,
  ) {}

  /**
   * 检查余额是否充足
   */
  async checkBalance(
    userId: string,
    amount: number,
    currency: 'balance' | 'lucky_coin' | 'points',
  ): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return false;

    const balance = currency === 'balance' ? user.balance :
                   currency === 'lucky_coin' ? user.luckyCoin :
                   user.points;

    return balance >= amount;
  }

  /**
   * 扣除余额
   */
  async deduct(
    userId: string,
    amount: number,
    currency: 'balance' | 'lucky_coin' | 'points',
    type: TransactionType,
    relatedId?: string,
    description?: string,
  ): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
      if (!user) throw new Error('用户不存在');

      const balanceField = currency === 'balance' ? 'balance' :
                          currency === 'lucky_coin' ? 'luckyCoin' :
                          'points';

      const currencyType = currency === 'balance' ? CurrencyType.BALANCE :
                          currency === 'lucky_coin' ? CurrencyType.LUCKY_COIN :
                          CurrencyType.POINTS;

      const balanceBefore = user[balanceField];
      
      if (balanceBefore < amount) {
        throw new Error('余额不足');
      }

      const balanceAfter = parseFloat((balanceBefore - amount).toFixed(2));

      // 更新用户余额
      await queryRunner.manager.update(User, { id: userId }, {
        [balanceField]: balanceAfter,
      });

      // 创建交易记录
      const transaction = queryRunner.manager.create(Transaction, {
        userId,
        type,
        currencyType,
        amount: -amount,
        balanceBefore,
        balanceAfter,
        relatedId,
        relatedType: type,
        description,
      });

      const saved = await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 增加余额（充值、奖励等）
   */
  async credit(
    userId: string,
    amount: number,
    currency: 'balance' | 'lucky_coin' | 'points',
    type: TransactionType,
    relatedId?: string,
    description?: string,
  ): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
      if (!user) throw new Error('用户不存在');

      const balanceField = currency === 'balance' ? 'balance' :
                          currency === 'lucky_coin' ? 'luckyCoin' :
                          'points';

      const currencyType = currency === 'balance' ? CurrencyType.BALANCE :
                          currency === 'lucky_coin' ? CurrencyType.LUCKY_COIN :
                          CurrencyType.POINTS;

      const balanceBefore = user[balanceField];
      const balanceAfter = parseFloat((balanceBefore + amount).toFixed(2));

      await queryRunner.manager.update(User, { id: userId }, {
        [balanceField]: balanceAfter,
      });

      const transaction = queryRunner.manager.create(Transaction, {
        userId,
        type,
        currencyType,
        amount,
        balanceBefore,
        balanceAfter,
        relatedId,
        relatedType: type,
        description,
      });

      const saved = await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 退款
   */
  async refund(
    userId: string,
    amount: number,
    currency: 'balance' | 'lucky_coin' | 'points',
    relatedId?: string,
  ): Promise<Transaction> {
    return this.credit(
      userId,
      amount,
      currency,
      TransactionType.REFUND,
      relatedId,
      '抽奖退款',
    );
  }

  /**
   * 获取用户钱包信息
   */
  async getWallet(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'balance', 'luckyCoin', 'points'],
    });

    return {
      balance: user?.balance || 0,
      luckyCoin: user?.luckyCoin || 0,
      points: user?.points || 0,
    };
  }

  /**
   * 获取交易记录
   */
  async getTransactions(userId: string, page: number = 1, limit: number = 20) {
    const [transactions, total] = await this.transactionRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
