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
  OneToMany,
} from 'typeorm';
import { Gacha } from './gacha.entity';
import { GachaDraw } from './gacha-draw.entity';

export enum SeriesRarity {
  N = 'N',
  R = 'R',
  SR = 'SR',
  SSR = 'SSR',
  UR = 'UR',
  LR = 'LR',
}

@Entity('gacha_series')
@Index(['gachaId'])
export class GachaSeries {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '扭蛋机ID' })
  gachaId: string;

  @Column({ type: 'varchar', length: 100, comment: '系列名称' })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '系列图片' })
  image: string;

  @Column({
    type: 'enum',
    enum: SeriesRarity,
    default: SeriesRarity.N,
    comment: '稀有度',
  })
  rarity: SeriesRarity;

  @Column({ type: 'decimal', precision: 5, scale: 4, comment: '概率(0-1)' })
  probability: number;

  @Column({ type: 'int', default: 0, comment: '库存数量' })
  stock: number;

  @Column({ type: 'int', default: 0, comment: '已抽数量' })
  drawn: number;

  @Column({ type: 'int', default: 0, comment: '碎片数量(可获得)' })
  fragmentCount: number;

  @Column({ type: 'boolean', default: false, comment: '是否为保底奖励' })
  isPity: boolean;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sort: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  // 关联
  @ManyToOne(() => Gacha, (gacha) => gacha.series)
  @JoinColumn({ name: 'gachaId' })
  gacha: Gacha;

  @OneToMany(() => GachaDraw, (draw) => draw.series)
  draws: GachaDraw[];
}
