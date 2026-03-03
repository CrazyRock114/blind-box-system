/** @format */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Order } from './order.entity';
import { RecycleRecord } from './recycle-record.entity';

export enum ItemStatus {
  PENDING = 'pending',       // 待发货
  SHIPPED = 'shipped',       // 已发货
  DELIVERED = 'delivered',   // 已送达
  COMPLETED = 'completed',   // 已完成
  RECYCLED = 'recycled',     // 已回收
}

@Entity('order_items')
@Index(['orderId'])
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '订单ID' })
  orderId: string;

  @Column({ type: 'uuid', comment: '商品ID' })
  productId: string;

  @Column({ type: 'varchar', length: 100, comment: '商品名称' })
  productName: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '商品图片' })
  productImage: string;

  @Column({ type: 'uuid', nullable: true, comment: 'SKU ID' })
  skuId: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: 'SKU规格' })
  skuName: string;

  @Column({ type: 'int', comment: '数量' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '单价' })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '总价' })
  totalPrice: number;

  @Column({
    type: 'enum',
    enum: ItemStatus,
    default: ItemStatus.PENDING,
    comment: '状态',
  })
  status: ItemStatus;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '稀有度' })
  rarity: string;

  @Column({ type: 'json', nullable: true, comment: '扩展信息' })
  extra: Record<string, any>;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  // 关联
  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @OneToMany(() => RecycleRecord, (record) => record.orderItem)
  recycleRecords: RecycleRecord[];
}
