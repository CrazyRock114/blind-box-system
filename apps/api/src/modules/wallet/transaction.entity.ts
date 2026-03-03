import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

export enum TransactionType {
  RECHARGE = 'recharge',       // 充值
  CONSUME = 'consume',         // 消费
  REWARD = 'reward',           // 奖励
  RECYCLE = 'recycle',         // 回收
  REFUND = 'refund',           // 退款
  WITHDRAW = 'withdraw',       // 提现
  COMMISSION = 'commission',   // 分销佣金
}

export enum CurrencyType {
  BALANCE = 'balance',         // 余额
  LUCKY_COIN = 'lucky_coin',   // 幸运币
  POINTS = 'points',           // 积分
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36, name: 'user_id' })
  @Index()
  userId: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'enum', enum: CurrencyType, name: 'currency_type' })
  currencyType: CurrencyType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'balance_before' })
  balanceBefore: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'balance_after' })
  balanceAfter: number;

  @Column({ length: 36, nullable: true, name: 'related_id' })
  relatedId: string;

  @Column({ length: 50, nullable: true, name: 'related_type' })
  relatedType: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
