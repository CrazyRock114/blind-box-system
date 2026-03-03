import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

export enum LotteryType {
  NORMAL = 'normal',
  ICHIBAN = 'ichiban',
  TOWER = 'tower',
  GASHAPON = 'gashapon',
}

export enum LotteryStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('lottery_records')
export class LotteryRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36, name: 'user_id' })
  @Index()
  userId: string;

  @Column({ length: 36, name: 'box_pool_id' })
  @Index()
  boxPoolId: string;

  @Column({ length: 36, nullable: true, name: 'prize_id' })
  prizeId: string;

  @Column({ type: 'enum', enum: LotteryType })
  type: LotteryType;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'cost_amount' })
  costAmount: number;

  @Column({ type: 'enum', enum: ['balance', 'lucky_coin'], name: 'cost_type' })
  costType: 'balance' | 'lucky_coin';

  @Column({ type: 'enum', enum: LotteryStatus, default: LotteryStatus.PENDING })
  status: LotteryStatus;

  // 一番赏专用
  @Column({ type: 'int', nullable: true, name: 'ticket_number' })
  ticketNumber: number;

  // 爬塔专用
  @Column({ type: 'int', nullable: true, name: 'floor_number' })
  floorNumber: number;

  @Column({ type: 'boolean', default: false, name: 'is_climb_success' })
  isClimbSuccess: boolean;

  @Column({ type: 'text', nullable: true })
  metadata: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
