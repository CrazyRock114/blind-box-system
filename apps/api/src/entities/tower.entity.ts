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
import { TowerLevel } from './tower-level.entity';
import { TowerAttempt } from './tower-attempt.entity';

export enum TowerStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('towers')
export class Tower {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, comment: '爬塔名称' })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '封面图' })
  coverImage: string;

  @Column({ type: 'text', nullable: true, comment: '描述' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '参与价格' })
  price: number;

  @Column({ type: 'int', comment: '总层数' })
  totalLevels: number;

  @Column({
    type: 'enum',
    enum: TowerStatus,
    default: TowerStatus.DRAFT,
    comment: '状态',
  })
  status: TowerStatus;

  @Column({ type: 'boolean', default: true, comment: '失败是否掉落' })
  failDropEnabled: boolean;

  @Column({ type: 'int', default: 0, comment: '保底层数' })
  guaranteedLevel: number;

  @Column({ type: 'json', nullable: true, comment: '保底奖励配置' })
  guaranteedReward: Record<string, any>;

  @Column({ type: 'boolean', default: true, comment: '是否启用' })
  isActive: boolean;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @DeleteDateColumn({ comment: '删除时间' })
  deletedAt: Date;

  // 关联
  @OneToMany(() => TowerLevel, (level) => level.tower)
  levels: TowerLevel[];

  @OneToMany(() => TowerAttempt, (attempt) => attempt.tower)
  attempts: TowerAttempt[];
}
