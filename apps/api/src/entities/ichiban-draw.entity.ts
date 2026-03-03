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
import { Ichiban } from './ichiban.entity';
import { IchibanPool } from './ichiban-pool.entity';
import { User } from './user.entity';

@Entity('ichiban_draws')
@Index(['ichibanId'])
@Index(['userId'])
@Index(['poolId'])
export class IchibanDraw {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '一番赏ID' })
  ichibanId: string;

  @Column({ type: 'uuid', comment: '用户ID' })
  userId: string;

  @Column({ type: 'uuid', comment: '奖池ID' })
  poolId: string;

  @Column({ type: 'varchar', length: 50, comment: '奖池等级' })
  level: string;

  @Column({ type: 'varchar', length: 100, comment: '奖品名称' })
  rewardName: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '奖品图片' })
  rewardImage: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '单抽价格' })
  price: number;

  @Column({ type: 'boolean', default: false, comment: '是否Last赏' })
  isLast: boolean;

  @Column({ type: 'int', default: 0, comment: '票号' })
  ticketNumber: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  // 关联
  @ManyToOne(() => Ichiban, (ichiban) => ichiban.draws)
  @JoinColumn({ name: 'ichibanId' })
  ichiban: Ichiban;

  @ManyToOne(() => User, (user) => user.ichibanDraws)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => IchibanPool, (pool) => pool.draws)
  @JoinColumn({ name: 'poolId' })
  pool: IchibanPool;
}
