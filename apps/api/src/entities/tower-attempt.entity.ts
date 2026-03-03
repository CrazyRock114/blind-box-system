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
import { User } from './user.entity';

export enum TowerAttemptStatus {
  ONGOING = 'ongoing',      // 进行中
  SUCCESS = 'success',      // 通关成功
  FAILED = 'failed',        // 挑战失败
  ABORTED = 'aborted',      // 主动放弃
}

@Entity('tower_attempts')
@Index(['towerId'])
@Index(['userId'])
@Index(['status'])
export class TowerAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '爬塔ID' })
  towerId: string;

  @Column({ type: 'uuid', comment: '用户ID' })
  userId: string;

  @Column({ type: 'int', default: 1, comment: '当前层数' })
  currentLevel: number;

  @Column({ type: 'int', default: 0, comment: '最高层数' })
  maxLevel: number;

  @Column({
    type: 'enum',
    enum: TowerAttemptStatus,
    default: TowerAttemptStatus.ONGOING,
    comment: '状态',
  })
  status: TowerAttemptStatus;

  @Column({ type: 'json', nullable: true, comment: '已获得的奖励' })
  rewards: Record<string, any>[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '已消耗金额' })
  spentAmount: number;

  @Column({ type: 'datetime', nullable: true, comment: '完成时间' })
  completedAt: Date;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  // 关联
  @ManyToOne(() => Tower, (tower) => tower.attempts)
  @JoinColumn({ name: 'towerId' })
  tower: Tower;

  @ManyToOne(() => User, (user) => user.towerAttempts)
  @JoinColumn({ name: 'userId' })
  user: User;
}
