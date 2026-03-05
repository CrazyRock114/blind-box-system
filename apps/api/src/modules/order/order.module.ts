/** @format */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController, CartController } from './order.controller';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { Cart } from '../../entities/cart.entity';
import { Logistics } from '../../entities/logistics.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Cart, Logistics]),
  ],
  controllers: [OrderController, CartController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
