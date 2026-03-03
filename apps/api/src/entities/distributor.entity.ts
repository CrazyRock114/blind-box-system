/** @format */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Commission } from './commission.entity';
import { DistributorLevel } from './distributor-level.entity';
import { InviteCode } from './invite-code.entity';

export enum DistributorStatus {
  PENDING = 'pending',       // 待审核
  ACTIVE = 'active',         // 正常
  INACTIVE = 'inactive',     // 停用
  REJECTED = 'rejected',     // 已拒绝
}

@Entity('distributors')
@Index(['userId'], { unique: true })
@Index(['inviteCode'], { unique: true })
@Index(['parentId'])
@Index(['status'])
export class Distributor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '用户ID' })
  userId: string;

  @Column({ type: 'uuid', nullable: true, comment: '上级分销商ID' })
  parentId: string;

  @Column({ type: 'varchar', length: 20, comment: '邀请码' })
  inviteCode: string;

  @Column({ type: 'int', default: 1, comment: '分销等级' })
  level: number;

  @Column({
    type: 'enum',
    enum: DistributorStatus,
    default: DistributorStatus.PENDING,
    comment: '状态',
  })
  status: DistributorStatus;

  @Column({ type: 'int', default: 0, comment: '直接下级数' })
  directCount: number;

  @Column({ type: 'int', default: 0, comment: '团队人数' })
  teamCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '累计佣金' })
  totalCommission: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '可提现佣金' })
  availableCommission: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '已提现佣金' })
  withdrawnCommission: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '冻结佣金' })
  frozenCommission: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  // 关联
  @ManyToOne(() => User, (user) => user.distributors)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Distributor, (distributor) => distributor.children)
  @JoinColumn({ name: 'parentId' })
  parent: Distributor;

  @OneToMany(() => Distributor, (distributor) => distributor.parent)
  children: Distributor[];

  @OneToMany(() => Commission, (commission) => commission.distributor)
  commissions: Commission[];

  @ManyToOne(() => DistributorLevel, (level) => level.distributors)
  @JoinColumn({ name: 'level' })
  distributorLevel: DistributorLevel;

  @OneToMany(() => InviteCode, (code) => code.distributor)
  inviteCodes: InviteCode[];
}
