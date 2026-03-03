/** @format */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { ProductCategory } from './product-category.entity';
import { ProductSku } from './product-sku.entity';
import { ProductImage } from './product-image.entity';
import { Cart } from './cart.entity';

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SOLD_OUT = 'sold_out',
}

export enum ProductType {
  NORMAL = 'normal',     // 普通商品
  BLIND_BOX = 'blind_box', // 盲盒
  ICHIBAN = 'ichiban',   // 一番赏
  TOWER = 'tower',       // 爬塔
  GACHA = 'gacha',       // 扭蛋
}

@Entity('products')
@Index(['categoryId'])
@Index(['status'])
@Index(['type'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, comment: '商品名称' })
  name: string;

  @Column({ type: 'varchar', length: 50, comment: '商品编号' })
  code: string;

  @Column({ type: 'text', nullable: true, comment: '商品描述' })
  description: string;

  @Column({ type: 'uuid', nullable: true, comment: '分类ID' })
  categoryId: string;

  @Column({
    type: 'enum',
    enum: ProductType,
    default: ProductType.BLIND_BOX,
    comment: '商品类型',
  })
  type: ProductType;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
    comment: '状态',
  })
  status: ProductStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '原价' })
  originalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '售价' })
  price: number;

  @Column({ type: 'int', default: 0, comment: '库存数量' })
  stock: number;

  @Column({ type: 'int', default: 0, comment: '销量' })
  sales: number;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '封面图' })
  coverImage: string;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sort: number;

  @Column({ type: 'boolean', default: false, comment: '是否推荐' })
  isRecommend: boolean;

  @Column({ type: 'boolean', default: false, comment: '是否新品' })
  isNew: boolean;

  @Column({ type: 'json', nullable: true, comment: '扩展配置' })
  extraConfig: Record<string, any>;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @DeleteDateColumn({ comment: '删除时间' })
  deletedAt: Date;

  // 关联
  @ManyToOne(() => ProductCategory, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: ProductCategory;

  @OneToMany(() => ProductSku, (sku) => sku.product)
  skus: ProductSku[];

  @OneToMany(() => ProductImage, (image) => image.product)
  images: ProductImage[];

  @OneToMany(() => Cart, (cart) => cart.product)
  carts: Cart[];
}
