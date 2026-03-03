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

export enum AccountType {
  BALANCE = 'balance',      // 余额
  LUCKY_COIN = 'lucky_coin', // 幸运币
  POINTS = 'points',        // 积分
}

@Entity('user_accounts')
@Index(['userId', 'type'], { unique: true })
export class UserAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '用户ID' })
  userId: string;

  @Column({
    type: 'enum',
    enum: AccountType,
    comment: '账户类型',
  })
  type: AccountType;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, comment: '可用余额' })
  balance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, comment: '冻结金额' })
  frozen: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, comment: '累计收入' })
  totalIncome: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, comment: '累计支出' })
  totalExpense: number;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  // 关联
  @ManyToOne(() => User, (user) => user.accounts)
  @JoinColumn({ name: 'userId' })
  user: User;
}
