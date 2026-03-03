/** @format */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { GachaSeries } from './gacha-series.entity';

export enum GachaStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('gachas')
export class Gacha {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, comment: '扭蛋机名称' })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '封面图' })
  coverImage: string;

  @Column({ type: 'text', nullable: true, comment: '描述' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '单抽价格' })
  price: number;

  @Column({ type: 'int', comment: '十连抽折扣(%)' })
  tenDrawDiscount: number;

  @Column({ type: 'int', default: 0, comment: '保底次数' })
  pityCount: number;

  @Column({
    type: 'enum',
    enum: GachaStatus,
    default: GachaStatus.DRAFT,
    comment: '状态',
  })
  status: GachaStatus;

  @Column({ type: 'boolean', default: true, comment: '是否启用碎片系统' })
  fragmentEnabled: boolean;

  @Column({ type: 'json', nullable: true, comment: '保底奖励配置' })
  pityReward: Record<string, any>;

  @Column({ type: 'boolean', default: true, comment: '是否启用' })
  isActive: boolean;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @DeleteDateColumn({ comment: '删除时间' })
  deletedAt: Date;

  // 关联
  @OneToMany(() => GachaSeries, (series) => series.gacha)
  series: GachaSeries[];
}
