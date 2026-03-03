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
import { Distributor } from './distributor.entity';
import { User } from './user.entity';
import { Order } from './order.entity';

export enum CommissionStatus {
  PENDING = 'pending',       // 待结算
  SETTLED = 'settled',       // 已结算
  CANCELLED = 'cancelled',   // 已取消
  WITHDRAWN = 'withdrawn',   // 已提现
}

export enum CommissionLevel {
  DIRECT = 'direct',         // 直推
  INDIRECT = 'indirect',     // 间推
  TEAM = 'team',             // 团队
}

@Entity('commissions')
@Index(['distributorId'])
@Index(['fromUserId'])
@Index(['orderId'])
@Index(['status'])
export class Commission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '分销商ID' })
  distributorId: string;

  @Column({ type: 'uuid', comment: '来源用户ID' })
  fromUserId: string;

  @Column({ type: 'uuid', comment: '关联订单ID' })
  orderId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '订单金额' })
  orderAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '佣金金额' })
  amount: number;

  @Column({
    type: 'enum',
    enum: CommissionLevel,
    comment: '佣金层级',
  })
  level: CommissionLevel;

  @Column({ type: 'decimal', precision: 5, scale: 4, comment: '佣金比例' })
  rate: number;

  @Column({
    type: 'enum',
    enum: CommissionStatus,
    default: CommissionStatus.PENDING,
    comment: '状态',
  })
  status: CommissionStatus;

  @Column({ type: 'datetime', nullable: true, comment: '结算时间' })
  settledAt: Date;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  // 关联
  @ManyToOne(() => Distributor, (distributor) => distributor.commissions)
  @JoinColumn({ name: 'distributorId' })
  distributor: Distributor;

  @ManyToOne(() => User, (user) => user.commissionsFrom)
  @JoinColumn({ name: 'fromUserId' })
  fromUser: User;

  @ManyToOne(() => Order, (order) => order.commissions)
  @JoinColumn({ name: 'orderId' })
  order: Order;
}
