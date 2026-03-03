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
import { Order } from './order.entity';
import { User } from './user.entity';

export enum PaymentStatus {
  PENDING = 'pending',       // 待支付
  SUCCESS = 'success',       // 支付成功
  FAILED = 'failed',         // 支付失败
  CANCELLED = 'cancelled',   // 已取消
  REFUNDED = 'refunded',     // 已退款
}

export enum PaymentType {
  WECHAT = 'wechat',         // 微信支付
  BALANCE = 'balance',       // 余额支付
  LUCKY_COIN = 'lucky_coin', // 幸运币支付
}

@Entity('payments')
@Index(['orderId'])
@Index(['userId'])
@Index(['tradeNo'], { unique: true })
@Index(['status'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '订单ID' })
  orderId: string;

  @Column({ type: 'uuid', comment: '用户ID' })
  userId: string;

  @Column({ type: 'varchar', length: 32, comment: '支付流水号' })
  tradeNo: string;

  @Column({
    type: 'enum',
    enum: PaymentType,
    comment: '支付方式',
  })
  type: PaymentType;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '支付金额' })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
    comment: '支付状态',
  })
  status: PaymentStatus;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '第三方交易号' })
  thirdPartyNo: string;

  @Column({ type: 'datetime', nullable: true, comment: '支付完成时间' })
  paidAt: Date;

  @Column({ type: 'text', nullable: true, comment: '支付响应数据' })
  responseData: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  // 关联
  @ManyToOne(() => Order, (order) => order.payments)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => User, (user) => user.payments)
  @JoinColumn({ name: 'userId' })
  user: User;
}
