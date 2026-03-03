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
import { Tower } from './tower.entity';

@Entity('tower_levels')
@Index(['towerId'])
export class TowerLevel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '爬塔ID' })
  towerId: string;

  @Column({ type: 'int', comment: '层数' })
  level: number;

  @Column({ type: 'varchar', length: 100, comment: '关卡名称' })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '关卡图片' })
  image: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, comment: '通关概率(%)' })
  successRate: number;

  @Column({ type: 'varchar', length: 100, comment: '通关奖励名称' })
  rewardName: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '通关奖励图片' })
  rewardImage: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '奖励价值' })
  rewardValue: number;

  @Column({ type: 'json', nullable: true, comment: '失败掉落配置' })
  failDropConfig: Record<string, any>;

  @Column({ type: 'boolean', default: false, comment: '是否为保底层' })
  isGuaranteed: boolean;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  // 关联
  @ManyToOne(() => Tower, (tower) => tower.levels)
  @JoinColumn({ name: 'towerId' })
  tower: Tower;
}
