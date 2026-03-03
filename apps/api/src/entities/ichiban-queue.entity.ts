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
import { Ichiban } from './ichiban.entity';
import { User } from './user.entity';

export enum QueueStatus {
  WAITING = 'waiting',      // 等待中
  PLAYING = 'playing',      // 游玩中
  FINISHED = 'finished',    // 已完成
  CANCELLED = 'cancelled',  // 已取消
}

@Entity('ichiban_queues')
@Index(['ichibanId'])
@Index(['userId'])
@Index(['status'])
export class IchibanQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '一番赏ID' })
  ichibanId: string;

  @Column({ type: 'uuid', comment: '用户ID' })
  userId: string;

  @Column({ type: 'int', comment: '排队序号' })
  queueNumber: number;

  @Column({
    type: 'enum',
    enum: QueueStatus,
    default: QueueStatus.WAITING,
    comment: '状态',
  })
  status: QueueStatus;

  @Column({ type: 'int', default: 0, comment: '预定抽数' })
  drawCount: number;

  @Column({ type: 'datetime', nullable: true, comment: '开始游玩时间' })
  startAt: Date;

  @Column({ type: 'datetime', nullable: true, comment: '结束时间' })
  endAt: Date;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  // 关联
  @ManyToOne(() => Ichiban, (ichiban) => ichiban.queues)
  @JoinColumn({ name: 'ichibanId' })
  ichiban: Ichiban;

  @ManyToOne(() => User, (user) => user.ichibanQueues)
  @JoinColumn({ name: 'userId' })
  user: User;
}
