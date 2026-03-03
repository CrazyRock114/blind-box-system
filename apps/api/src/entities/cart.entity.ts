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
import { Product } from './product.entity';
import { ProductSku } from './product-sku.entity';

@Entity('carts')
@Index(['userId'])
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '用户ID' })
  userId: string;

  @Column({ type: 'uuid', comment: '商品ID' })
  productId: string;

  @Column({ type: 'uuid', nullable: true, comment: 'SKU ID' })
  skuId: string;

  @Column({ type: 'int', default: 1, comment: '数量' })
  quantity: number;

  @Column({ type: 'boolean', default: false, comment: '是否选中' })
  isSelected: boolean;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  // 关联
  @ManyToOne(() => User, (user) => user.carts)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Product, (product) => product.carts)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => ProductSku, (sku) => sku.carts)
  @JoinColumn({ name: 'skuId' })
  sku: ProductSku;
}
