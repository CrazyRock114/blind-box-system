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
import { Gacha } from './gacha.entity';
import { GachaSeries } from './gacha-series.entity';
import { User } from './user.entity';

@Entity('gacha_draws')
@Index(['gachaId'])
@Index(['userId'])
@Index(['seriesId'])
export class GachaDraw {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '扭蛋机ID' })
  gachaId: string;

  @Column({ type: 'uuid', comment: '用户ID' })
  userId: string;

  @Column({ type: 'uuid', comment: '系列ID' })
  seriesId: string;

  @Column({ type: 'varchar', length: 100, comment: '奖品名称' })
  rewardName: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '奖品图片' })
  rewardImage: string;

  @Column({ type: 'varchar', length: 10, comment: '稀有度' })
  rarity: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '单抽价格' })
  price: number;

  @Column({ type: 'int', default: 0, comment: '获得碎片数量' })
  fragmentCount: number;

  @Column({ type: 'boolean', default: false, comment: '是否为保底' })
  isPity: boolean;

  @Column({ type: 'int', comment: '抽卡序号' })
  drawNumber: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  // 关联
  @ManyToOne(() => Gacha, (gacha) => gacha.draws)
  @JoinColumn({ name: 'gachaId' })
  gacha: Gacha;

  @ManyToOne(() => User, (user) => user.gachaDraws)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => GachaSeries, (series) => series.draws)
  @JoinColumn({ name: 'seriesId' })
  series: GachaSeries;
}
