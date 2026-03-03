/** @format */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { OrderItem } from './order-item.entity';

export enum RecycleStatus {
  PENDING = 'pending',       // 待处理
  COMPLETED = 'completed',   // 已完成
  REJECTED = 'rejected',     // 已拒绝
}

@Entity('recycle_records')
@Index(['userId'])
@Index(['orderItemId'])
@Index(['status'])
export class RecycleRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '用户ID' })
  userId: string;

  @Column({ type: 'uuid', comment: '订单商品ID' })
  orderItemId: string;

  @Column({ type: 'varchar', length: 100, comment: '商品名称' })
  productName: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '商品图片' })
  productImage: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '原价' })
  originalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '回收积分' })
  recyclePoints: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, comment: '回收折扣率' })
  recycleRate: number;

  @Column({
    type: 'enum',
    enum: RecycleStatus,
    default: RecycleStatus.PENDING,
    comment: '状态',
  })
  status: RecycleStatus;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '拒绝原因' })
  rejectReason: string;

  @Column({ type: 'datetime', nullable: true, comment: '处理时间' })
  processedAt: Date;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  // 关联
  @ManyToOne(() => User, (user) => user.recycleRecords)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => OrderItem, (item) => item.recycleRecords)
  @JoinColumn({ name: 'orderItemId' })
  orderItem: OrderItem;
}
