/** @format */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from './product.entity';
import { Cart } from './cart.entity';

export enum SkuStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('product_skus')
@Index(['productId'])
export class ProductSku {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '商品ID' })
  productId: string;

  @Column({ type: 'varchar', length: 100, comment: 'SKU名称' })
  name: string;

  @Column({ type: 'varchar', length: 100, comment: 'SKU编码' })
  code: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '售价' })
  price: number;

  @Column({ type: 'int', default: 0, comment: '库存' })
  stock: number;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '图片' })
  image: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '稀有度' })
  rarity: string;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0, comment: '概率(0-1)' })
  probability: number;

  @Column({
    type: 'enum',
    enum: SkuStatus,
    default: SkuStatus.ACTIVE,
    comment: '状态',
  })
  status: SkuStatus;

  @Column({ type: 'json', nullable: true, comment: '属性规格' })
  attributes: Record<string, any>;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  // 关联
  @ManyToOne(() => Product, (product) => product.skus)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @OneToMany(() => Cart, (cart) => cart.sku)
  carts: Cart[];
}
