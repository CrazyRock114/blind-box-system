/** @format */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Logistics } from './logistics.entity';
import { Payment } from './payment.entity';
import { Commission } from './commission.entity';
import { User } from './user.entity';

export enum OrderStatus {
  PENDING_PAY = 'pending_pay',     // 待支付
  PAID = 'paid',                   // 已支付
  SHIPPED = 'shipped',             // 已发货
  DELIVERED = 'delivered',         // 已送达
  COMPLETED = 'completed',         // 已完成
  CANCELLED = 'cancelled',         // 已取消
  REFUNDING = 'refunding',         // 退款中
  REFUNDED = 'refunded',           // 已退款
}

export enum OrderType {
  BLIND_BOX = 'blind_box',
  ICHIBAN = 'ichiban',
  TOWER = 'tower',
  GACHA = 'gacha',
  RECHARGE = 'recharge',
}

@Entity('orders')
@Index(['userId'])
@Index(['orderNo'], { unique: true })
@Index(['status'])
@Index(['type'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 32, comment: '订单编号' })
  orderNo: string;

  @Column({ type: 'uuid', comment: '用户ID' })
  userId: string;

  @Column({
    type: 'enum',
    enum: OrderType,
    comment: '订单类型',
  })
  type: OrderType;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING_PAY,
    comment: '订单状态',
  })
  status: OrderStatus;

  @Column({ type: 'int', comment: '商品数量' })
  totalCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '商品总金额' })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '优惠金额' })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '实付金额' })
  payAmount: number;

  @Column({ type: 'varchar', length: 20, default: '', comment: '支付方式' })
  payType: string;

  @Column({ type: 'datetime', nullable: true, comment: '支付时间' })
  paidAt: Date;

  @Column({ type: 'varchar', length: 100, default: '', comment: '支付流水号' })
  payTradeNo: string;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @DeleteDateColumn({ comment: '删除时间' })
  deletedAt: Date;

  // 关联
  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Logistics, (logistics) => logistics.order)
  logistics: Logistics[];

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];

  @OneToMany(() => Commission, (commission) => commission.order)
  commissions: Commission[];
}
