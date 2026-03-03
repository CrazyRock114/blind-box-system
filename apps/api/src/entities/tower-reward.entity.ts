/** @format */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TowerAttempt } from './tower-attempt.entity';
import { User } from './user.entity';

@Entity('tower_rewards')
@Index(['attemptId'])
@Index(['userId'])
export class TowerReward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '尝试记录ID' })
  attemptId: string;

  @Column({ type: 'uuid', comment: '用户ID' })
  userId: string;

  @Column({ type: 'int', comment: '层数' })
  level: number;

  @Column({ type: 'varchar', length: 100, comment: '奖励名称' })
  rewardName: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '奖励图片' })
  rewardImage: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '奖励价值' })
  rewardValue: number;

  @Column({ type: 'boolean', default: true, comment: '是否通过' })
  isSuccess: boolean;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  // 关联
  @ManyToOne(() => TowerAttempt, (attempt) => attempt.rewards)
  @JoinColumn({ name: 'attemptId' })
  attempt: TowerAttempt;

  @ManyToOne(() => User, (user) => user.towerRewards)
  @JoinColumn({ name: 'userId' })
  user: User;
}
