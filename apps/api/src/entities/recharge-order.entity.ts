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

export enum RechargeStatus {
  PENDING = 'pending',       // 待支付
  SUCCESS = 'success',       // 充值成功
  FAILED = 'failed',         // 充值失败
  CANCELLED = 'cancelled',   // 已取消
}

@Entity('recharge_orders')
@Index(['userId'])
@Index(['orderNo'], { unique: true })
@Index(['status'])
export class RechargeOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '用户ID' })
  userId: string;

  @Column({ type: 'varchar', length: 32, comment: '充值订单号' })
  orderNo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '充值金额' })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '赠送金额' })
  bonus: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '实际到账' })
  actualAmount: number;

  @Column({
    type: 'enum',
    enum: RechargeStatus,
    default: RechargeStatus.PENDING,
    comment: '状态',
  })
  status: RechargeStatus;

  @Column({ type: 'varchar', length: 20, default: 'wechat', comment: '支付方式' })
  payType: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '第三方交易号' })
  thirdPartyNo: string;

  @Column({ type: 'datetime', nullable: true, comment: '支付时间' })
  paidAt: Date;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  // 关联
  @ManyToOne(() => User, (user) => user.rechargeOrders)
  @JoinColumn({ name: 'userId' })
  user: User;
}
