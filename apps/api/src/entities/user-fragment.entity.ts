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
import { Fragment } from './fragment.entity';

@Entity('user_fragments')
@Index(['userId', 'fragmentId'], { unique: true })
export class UserFragment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '用户ID' })
  userId: string;

  @Column({ type: 'uuid', comment: '碎片ID' })
  fragmentId: string;

  @Column({ type: 'int', default: 0, comment: '当前数量' })
  count: number;

  @Column({ type: 'int', default: 0, comment: '已兑换数量' })
  exchanged: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  // 关联
  @ManyToOne(() => User, (user) => user.fragments)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Fragment, (fragment) => fragment.userFragments)
  @JoinColumn({ name: 'fragmentId' })
  fragment: Fragment;
}
