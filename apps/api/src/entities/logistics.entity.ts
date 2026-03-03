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

export enum LogisticsStatus {
  PENDING = 'pending',       // 待发货
  SHIPPED = 'shipped',       // 已发货
  IN_TRANSIT = 'in_transit', // 运输中
  DELIVERED = 'delivered',   // 已送达
  SIGNED = 'signed',         // 已签收
}

@Entity('logistics')
@Index(['orderId'])
@Index(['userId'])
@Index(['trackingNo'])
export class Logistics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '订单ID' })
  orderId: string;

  @Column({ type: 'uuid', comment: '用户ID' })
  userId: string;

  @Column({ type: 'varchar', length: 50, comment: '快递公司' })
  company: string;

  @Column({ type: 'varchar', length: 50, comment: '快递单号' })
  trackingNo: string;

  @Column({
    type: 'enum',
    enum: LogisticsStatus,
    default: LogisticsStatus.PENDING,
    comment: '物流状态',
  })
  status: LogisticsStatus;

  @Column({ type: 'varchar', length: 100, comment: '收货人姓名' })
  receiverName: string;

  @Column({ type: 'varchar', length: 20, comment: '收货人手机' })
  receiverPhone: string;

  @Column({ type: 'varchar', length: 255, comment: '收货地址' })
  receiverAddress: string;

  @Column({ type: 'datetime', nullable: true, comment: '发货时间' })
  shippedAt: Date;

  @Column({ type: 'datetime', nullable: true, comment: '签收时间' })
  signedAt: Date;

  @Column({ type: 'json', nullable: true, comment: '物流轨迹' })
  traces: Record<string, any>[];

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  // 关联
  @ManyToOne(() => Order, (order) => order.logistics)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => User, (user) => user.logistics)
  @JoinColumn({ name: 'userId' })
  user: User;
}
