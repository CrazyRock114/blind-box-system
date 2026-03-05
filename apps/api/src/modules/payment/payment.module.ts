/** @format */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Payment } from '../../entities/payment.entity';
import { RechargeOrder } from '../../entities/recharge-order.entity';
import { Transaction } from '../../entities/transaction.entity';
import { Order } from '../../entities/order.entity';
import { UserAccount } from '../../entities/user-account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, RechargeOrder, Transaction, Order, UserAccount]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
