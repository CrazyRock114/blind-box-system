/** @format */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum TransactionType {
  RECHARGE = 'recharge',           // 充值
  CONSUME = 'consume',             // 消费
  REFUND = 'refund',               // 退款
  COMMISSION = 'commission',       // 佣金
  RECYCLE = 'recycle',             // 回收
  EXCHANGE = 'exchange',           // 兑换
  ADJUST = 'adjust',               // 调整
}

export enum TransactionStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
}

@Entity('transactions')
@Index(['userId'])
@Index(['type'])
@Index(['createdAt'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '用户ID' })
  userId: string;

  @Column({ type: 'varchar', length: 32, comment: '流水号' })
  serialNo: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
    comment: '交易类型',
  })
  type: TransactionType;

  @Column({ type: 'varchar', length: 20, comment: '账户类型' })
  accountType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '变动金额' })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '变动前余额' })
  balanceBefore: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '变动后余额' })
  balanceAfter: number;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.SUCCESS,
    comment: '状态',
  })
  status: TransactionStatus;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '关联订单号' })
  relatedOrderNo: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '描述' })
  description: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  // 关联
  @ManyToOne(() => User, (user) => user.transactions)
  @JoinColumn({ name: 'userId' })
  user: User;
}
