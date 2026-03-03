import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BoxPool } from './box-pool.entity';

export enum PrizeLevel {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  LAST = 'LAST',
  NORMAL = 'NORMAL',
}

export enum PrizeType {
  GOODS = 'goods',      // 实物商品
  VIRTUAL = 'virtual',  // 虚拟商品
  POINTS = 'points',    // 积分
  COUPON = 'coupon',    // 优惠券
  FRAGMENT = 'fragment', // 碎片
}

@Entity('prizes')
export class Prize {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36, name: 'box_pool_id' })
  boxPoolId: string;

  @ManyToOne(() => BoxPool, boxPool => boxPool.prizes)
  @JoinColumn({ name: 'box_pool_id' })
  boxPool: BoxPool;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255 })
  image: string;

  @Column({ type: 'enum', enum: PrizeLevel, default: PrizeLevel.NORMAL })
  level: PrizeLevel;

  @Column({ type: 'enum', enum: PrizeType, default: PrizeType.GOODS })
  type: PrizeType;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  // 概率相关（权重算法）
  @Column({ type: 'int', default: 0 })
  weight: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0 })
  probability: number;

  // 库存管理
  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'int', default: 0, name: 'total_stock' })
  totalStock: number;

  @Column({ type: 'int', default: 0, name: 'sold_count' })
  soldCount: number;

  // 碎片相关
  @Column({ type: 'boolean', default: false, name: 'is_fragment' })
  isFragment: boolean;

  @Column({ type: 'int', default: 0, name: 'fragment_count' })
  fragmentCount: number;

  @Column({ length: 36, nullable: true, name: 'exchange_prize_id' })
  exchangePrizeId: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
