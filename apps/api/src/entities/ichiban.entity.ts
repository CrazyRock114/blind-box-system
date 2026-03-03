/** @format */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { IchibanPool } from './ichiban-pool.entity';
import { IchibanQueue } from './ichiban-queue.entity';
import { IchibanDraw } from './ichiban-draw.entity';

export enum IchibanStatus {
  PENDING = 'pending',    // 待开始
  ACTIVE = 'active',      // 进行中
  FINISHED = 'finished',  // 已结束
  SOLD_OUT = 'sold_out',  // 已售罄
}

@Entity('ichibans')
@Index(['status'])
export class Ichiban {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, comment: '一番赏名称' })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '封面图' })
  coverImage: string;

  @Column({ type: 'text', nullable: true, comment: '描述' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '单抽价格' })
  price: number;

  @Column({ type: 'int', comment: '总票数' })
  totalTickets: number;

  @Column({ type: 'int', default: 0, comment: '已售票数' })
  soldTickets: number;

  @Column({ type: 'int', default: 0, comment: '剩余票数' })
  remainingTickets: number;

  @Column({ type: 'int', default: 0, comment: '排队人数' })
  queueCount: number;

  @Column({
    type: 'enum',
    enum: IchibanStatus,
    default: IchibanStatus.PENDING,
    comment: '状态',
  })
  status: IchibanStatus;

  @Column({ type: 'datetime', nullable: true, comment: '开始时间' })
  startAt: Date;

  @Column({ type: 'datetime', nullable: true, comment: '结束时间' })
  endAt: Date;

  @Column({ type: 'json', nullable: true, comment: 'Last赏配置' })
  lastReward: Record<string, any>;

  @Column({ type: 'boolean', default: true, comment: '是否启用' })
  isActive: boolean;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @DeleteDateColumn({ comment: '删除时间' })
  deletedAt: Date;

  // 关联
  @OneToMany(() => IchibanPool, (pool) => pool.ichiban)
  pools: IchibanPool[];

  @OneToMany(() => IchibanQueue, (queue) => queue.ichiban)
  queues: IchibanQueue[];

  @OneToMany(() => IchibanDraw, (draw) => draw.ichiban)
  draws: IchibanDraw[];
}
