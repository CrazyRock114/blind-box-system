/** @format */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserFragment } from './user-fragment.entity';

@Entity('fragments')
export class Fragment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, comment: '碎片名称' })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '碎片图片' })
  image: string;

  @Column({ type: 'text', nullable: true, comment: '描述' })
  description: string;

  @Column({ type: 'int', comment: '兑换所需数量' })
  requiredCount: number;

  @Column({ type: 'uuid', comment: '兑换商品ID' })
  exchangeProductId: string;

  @Column({ type: 'varchar', length: 100, comment: '兑换商品名称' })
  exchangeProductName: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '兑换商品图片' })
  exchangeProductImage: string;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sort: number;

  @Column({ type: 'boolean', default: true, comment: '是否启用' })
  isActive: boolean;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  // 关联
  @OneToMany(() => UserFragment, (uf) => uf.fragment)
  userFragments: UserFragment[];
}
