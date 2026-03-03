/** @format */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserAddress } from './user-address.entity';
import { UserAccount } from './user-account.entity';
import { UserLevel } from './user-level.entity';
import { UserFragment } from './user-fragment.entity';
import { Distributor } from './distributor.entity';
import { Order } from './order.entity';
import { Cart } from './cart.entity';
import { Logistics } from './logistics.entity';
import { Payment } from './payment.entity';
import { RechargeOrder } from './recharge-order.entity';
import { Transaction } from './transaction.entity';
import { Commission } from './commission.entity';
import { InviteCode } from './invite-code.entity';
import { RecycleRecord } from './recycle-record.entity';
import { LuckyCoin } from './lucky-coin.entity';
import { IchibanQueue } from './ichiban-queue.entity';
import { IchibanDraw } from './ichiban-draw.entity';
import { TowerAttempt } from './tower-attempt.entity';
import { TowerReward } from './tower-reward.entity';
import { GachaDraw } from './gacha-draw.entity';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

@Entity('users')
@Index(['phone'], { unique: true })
@Index(['inviteCode'], { unique: true })
@Index(['parentId'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '手机号' })
  phone: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '密码' })
  password: string;

  @Column({ type: 'varchar', length: 50, default: '', comment: '昵称' })
  nickname: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '头像' })
  avatar: string;

  @Column({ type: 'varchar', length: 50, default: '', comment: '微信openid' })
  openid: string;

  @Column({ type: 'varchar', length: 50, default: '', comment: '微信unionid' })
  unionid: string;

  @Column({ type: 'varchar', length: 20, default: '', comment: '邀请码' })
  inviteCode: string;

  @Column({ type: 'uuid', nullable: true, comment: '上级用户ID' })
  parentId: string;

  @Column({ type: 'int', default: 0, comment: '用户等级' })
  level: number;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
    comment: '状态',
  })
  status: UserStatus;

  @Column({ type: 'datetime', nullable: true, comment: '最后登录时间' })
  lastLoginAt: Date;

  @Column({ type: 'varchar', length: 50, default: '', comment: '最后登录IP' })
  lastLoginIp: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  @DeleteDateColumn({ comment: '删除时间' })
  deletedAt: Date;

  // 关联
  @OneToMany(() => UserAddress, (address) => address.user)
  addresses: UserAddress[];

  @OneToMany(() => UserAccount, (account) => account.user)
  accounts: UserAccount[];

  @OneToMany(() => UserFragment, (fragment) => fragment.user)
  fragments: UserFragment[];

  @ManyToOne(() => UserLevel, (level) => level.users)
  @JoinColumn({ name: 'level' })
  userLevel: UserLevel;

  @OneToMany(() => Distributor, (distributor) => distributor.user)
  distributors: Distributor[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Cart, (cart) => cart.user)
  carts: Cart[];

  @OneToMany(() => Logistics, (logistics) => logistics.user)
  logistics: Logistics[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @OneToMany(() => RechargeOrder, (order) => order.user)
  rechargeOrders: RechargeOrder[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => Commission, (commission) => commission.fromUser)
  commissionsFrom: Commission[];

  @OneToMany(() => InviteCode, (code) => code.owner)
  inviteCodes: InviteCode[];

  @OneToMany(() => RecycleRecord, (record) => record.user)
  recycleRecords: RecycleRecord[];

  @OneToMany(() => LuckyCoin, (coin) => coin.user)
  luckyCoins: LuckyCoin[];

  @OneToMany(() => IchibanQueue, (queue) => queue.user)
  ichibanQueues: IchibanQueue[];

  @OneToMany(() => IchibanDraw, (draw) => draw.user)
  ichibanDraws: IchibanDraw[];

  @OneToMany(() => TowerAttempt, (attempt) => attempt.user)
  towerAttempts: TowerAttempt[];

  @OneToMany(() => TowerReward, (reward) => reward.user)
  towerRewards: TowerReward[];

  @OneToMany(() => GachaDraw, (draw) => draw.user)
  gachaDraws: GachaDraw[];
}
