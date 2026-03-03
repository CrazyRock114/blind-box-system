import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

export enum CommissionStatus {
  PENDING = 'pending',
  SETTLED = 'settled',
  CANCELLED = 'cancelled',
}

@Entity('distribution_records')
export class DistributionRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36, name: 'user_id' })
  @Index()
  userId: string;

  @Column({ length: 36, name: 'parent_id' })
  parentId: string;

  @Column({ length: 36, name: 'subordinate_id' })
  subordinateId: string;

  @Column({ length: 36, name: 'order_id' })
  orderId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  rate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  commission: number;

  @Column({ type: 'int', default: 1, name: 'level' })
  level: number;

  @Column({ type: 'enum', enum: CommissionStatus, default: CommissionStatus.PENDING })
  status: CommissionStatus;

  @Column({ type: 'timestamp', nullable: true, name: 'settled_at' })
  settledAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('user_relations')
export class UserRelation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 36, name: 'user_id' })
  @Index()
  userId: string;

  @Column({ length: 36, name: 'parent_id', nullable: true })
  parentId: string;

  @Column({ length: 20, name: 'invite_code', unique: true })
  inviteCode: string;

  @Column({ type: 'int', default: 0, name: 'total_subordinates' })
  totalSubordinates: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'total_commission' })
  totalCommission: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
