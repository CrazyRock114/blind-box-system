/** @format */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../../entities/payment.entity';
import { RechargeOrder } from '../../entities/recharge-order.entity';
import { Transaction } from '../../entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, RechargeOrder, Transaction]),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class PaymentModule {}
