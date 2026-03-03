/** @format */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Ichiban } from './ichiban.entity';
import { IchibanDraw } from './ichiban-draw.entity';

export enum PoolStatus {
  AVAILABLE = 'available',   // 可抽
  SOLD_OUT = 'sold_out',     // 已售罄
  LAST = 'last',             // Last赏
}

@Entity('ichiban_pools')
@Index(['ichibanId'])
export class IchibanPool {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '一番赏ID' })
  ichibanId: string;

  @Column({ type: 'varchar', length: 50, comment: '奖池等级(A/B/C等)' })
  level: string;

  @Column({ type: 'varchar', length: 100, comment: '奖品名称' })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '奖品图片' })
  image: string;

  @Column({ type: 'int', comment: '奖品数量' })
  quantity: number;

  @Column({ type: 'int', default: 0, comment: '剩余数量' })
  remaining: number;

  @Column({ type: 'int', default: 0, comment: '已抽数量' })
  drawn: number;

  @Column({
    type: 'enum',
    enum: PoolStatus,
    default: PoolStatus.AVAILABLE,
    comment: '状态',
  })
  status: PoolStatus;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sort: number;

  @Column({ type: 'boolean', default: false, comment: '是否Last赏' })
  isLast: boolean;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  // 关联
  @ManyToOne(() => Ichiban, (ichiban) => ichiban.pools)
  @JoinColumn({ name: 'ichibanId' })
  ichiban: Ichiban;

  @OneToMany(() => IchibanDraw, (draw) => draw.pool)
  draws: IchibanDraw[];
}
