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
import { Distributor } from './distributor.entity';

export enum InviteCodeStatus {
  UNUSED = 'unused',         // 未使用
  USED = 'used',             // 已使用
  EXPIRED = 'expired',       // 已过期
  DISABLED = 'disabled',     // 已禁用
}

@Entity('invite_codes')
@Index(['code'], { unique: true })
@Index(['ownerId'])
@Index(['status'])
export class InviteCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, comment: '邀请码' })
  code: string;

  @Column({ type: 'uuid', comment: '拥有者ID' })
  ownerId: string;

  @Column({ type: 'uuid', nullable: true, comment: '使用者ID' })
  userId: string;

  @Column({
    type: 'enum',
    enum: InviteCodeStatus,
    default: InviteCodeStatus.UNUSED,
    comment: '状态',
  })
  status: InviteCodeStatus;

  @Column({ type: 'datetime', nullable: true, comment: '过期时间' })
  expireAt: Date;

  @Column({ type: 'datetime', nullable: true, comment: '使用时间' })
  usedAt: Date;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  // 关联
  @ManyToOne(() => User, (user) => user.inviteCodes)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @ManyToOne(() => Distributor, (distributor) => distributor.inviteCodes)
  @JoinColumn({ name: 'ownerId' })
  distributor: Distributor;
}
