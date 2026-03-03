import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Prize } from './prize.entity';

export enum BoxType {
  NORMAL = 'normal',      // 普通盲盒
  ICHIBAN = 'ichiban',    // 一番赏
  TOWER = 'tower',        // 爬塔
  GASHAPON = 'gashapon',  // 扭蛋机
}

export enum BoxStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  SOLD_OUT = 'sold_out',
  ENDED = 'ended',
}

@Entity('box_pools')
export class BoxPool {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ length: 255, nullable: true })
  cover: string;

  @Column({ type: 'enum', enum: BoxType })
  type: BoxType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'enum', enum: BoxStatus, default: BoxStatus.DRAFT })
  status: BoxStatus;

  // 一番赏专用字段
  @Column({ type: 'int', default: 0, name: 'total_tickets' })
  totalTickets: number;

  @Column({ type: 'int', default: 0, name: 'sold_tickets' })
  soldTickets: number;

  @Column({ length: 36, nullable: true, name: 'last_prize_id' })
  lastPrizeId: string;

  // 爬塔专用字段
  @Column({ type: 'int', default: 0, name: 'max_floors' })
  maxFloors: number;

  @Column({ type: 'int', default: 0, name: 'guarantee_floor' })
  guaranteeFloor: number;

  // 扭蛋专用字段
  @Column({ length: 36, nullable: true, name: 'series_id' })
  seriesId: string;

  @Column({ type: 'boolean', default: true, name: 'use_lucky_coin' })
  useLuckyCoin: boolean;

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  sortOrder: number;

  @OneToMany(() => Prize, prize => prize.boxPool)
  prizes: Prize[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
