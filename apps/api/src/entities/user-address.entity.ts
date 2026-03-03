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

export enum AddressType {
  DEFAULT = 'default',
  NORMAL = 'normal',
}

@Entity('user_addresses')
@Index(['userId'])
export class UserAddress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', comment: '用户ID' })
  userId: string;

  @Column({ type: 'varchar', length: 50, comment: '收货人姓名' })
  name: string;

  @Column({ type: 'varchar', length: 20, comment: '手机号' })
  phone: string;

  @Column({ type: 'varchar', length: 100, comment: '省份' })
  province: string;

  @Column({ type: 'varchar', length: 100, comment: '城市' })
  city: string;

  @Column({ type: 'varchar', length: 100, comment: '区县' })
  district: string;

  @Column({ type: 'varchar', length: 255, comment: '详细地址' })
  address: string;

  @Column({ type: 'varchar', length: 10, default: '', comment: '邮编' })
  zipCode: string;

  @Column({
    type: 'enum',
    enum: AddressType,
    default: AddressType.NORMAL,
    comment: '地址类型',
  })
  type: AddressType;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  // 关联
  @ManyToOne(() => User, (user) => user.addresses)
  @JoinColumn({ name: 'userId' })
  user: User;
}
