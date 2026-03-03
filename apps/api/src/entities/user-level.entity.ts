/** @format */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_levels')
export class UserLevel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, comment: '等级名称' })
  name: string;

  @Column({ type: 'int', comment: '等级排序' })
  level: number;

  @Column({ type: 'int', default: 0, comment: '所需经验值/消费金额' })
  requiredValue: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, comment: '折扣率' })
  discount: number;

  @Column({ type: 'json', nullable: true, comment: '等级权益' })
  benefits: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '图标' })
  icon: string;

  @Column({ type: 'boolean', default: true, comment: '是否启用' })
  isActive: boolean;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;

  // 关联
  @OneToMany(() => User, (user) => user.userLevel)
  users: User[];
}
