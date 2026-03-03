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

export enum LuckyCoinType {
  SIGN_IN = 'sign_in',           // 签到
  SHARE = 'share',               // 分享
  TASK = 'task',                 // 任务
  EXCHANGE = 'exchange',         // 兑换
  CONSUME = 'consume',           // 消费
  DRAW = 'draw',                 // 抽奖
  SYSTEM = 'system',             // 系统
}

@Entity('lucky_coins')
@Index(['userId'])
@Index(['type'])
export class LuckyCoin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '用户ID' })
  userId: string;

  @Column({
    type: 'enum',
    enum: LuckyCoinType,
    comment: '类型',
  })
  type: LuckyCoinType;

  @Column({ type: 'int', comment: '数量(正数获得/负数消耗)' })
  amount: number;

  @Column({ type: 'int', comment: '变动前余额' })
  balanceBefore: number;

  @Column({ type: 'int', comment: '变动后余额' })
  balanceAfter: number;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '描述' })
  description: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  // 关联
  @ManyToOne(() => User, (user) => user.luckyCoins)
  @JoinColumn({ name: 'userId' })
  user: User;
}
