/** @format */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Distributor } from './distributor.entity';

@Entity('distributor_levels')
export class DistributorLevel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, comment: '等级名称' })
  name: string;

  @Column({ type: 'int', comment: '等级' })
  level: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, comment: '直推佣金比例' })
  directRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0, comment: '间推佣金比例' })
  indirectRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 4, default: 0, comment: '团队佣金比例' })
  teamRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '升级所需消费' })
  upgradeAmount: number;

  @Column({ type: 'int', default: 0, comment: '升级所需直推人数' })
  upgradeDirectCount: number;

  @Column({ type: 'json', nullable: true, comment: '等级权益' })
  benefits: Record<string, any>;

  @Column({ type: 'boolean', default: true, comment: '是否启用' })
  isActive: boolean;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  // 关联
  @OneToMany(() => Distributor, (distributor) => distributor.distributorLevel)
  distributors: Distributor[];
}
