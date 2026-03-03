import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum OrderType {
  LOTTERY = 'lottery',     // 抽奖消费
  RECHARGE = 'recharge',   // 充值
  RECYCLE = 'recycle',     // 回收
  SHIP = 'ship',           // 发货
  REFUND = 'refund',       // 退款
}

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum ShipStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  RECEIVED = 'received',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36, name: 'user_id' })
  @Index()
  userId: string;

  @Column({ length: 36, nullable: true, name: 'lottery_record_id' })
  lotteryRecordId: string;

  @Column({ type: 'enum', enum: OrderType })
  type: OrderType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  // 发货相关
  @Column({ type: 'enum', enum: ShipStatus, default: ShipStatus.PENDING, name: 'ship_status' })
  shipStatus: ShipStatus;

  @Column({ length: 50, nullable: true, name: 'tracking_number' })
  trackingNumber: string;

  @Column({ length: 100, nullable: true, name: 'shipping_company' })
  shippingCompany: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 20, nullable: true, name: 'contact_phone' })
  contactPhone: string;

  @Column({ length: 50, nullable: true, name: 'contact_name' })
  contactName: string;

  // 回收相关
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'recycle_points' })
  recyclePoints: number;

  @Column({ length: 255, nullable: true })
  remark: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
