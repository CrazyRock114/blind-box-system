/** @format */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('system_configs')
export class SystemConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true, comment: '配置键' })
  configKey: string;

  @Column({ type: 'text', comment: '配置值' })
  configValue: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '配置名称' })
  configName: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '描述' })
  description: string;

  @Column({ type: 'varchar', length: 20, default: 'string', comment: '值类型' })
  valueType: string;

  @Column({ type: 'boolean', default: true, comment: '是否可编辑' })
  isEditable: boolean;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updatedAt: Date;
}
