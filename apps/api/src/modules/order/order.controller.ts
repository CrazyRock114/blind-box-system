/** @format */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrderStatus, OrderType } from '../../entities/order.entity';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * 获取订单列表
   * GET /api/orders?page=1&limit=20&status=&type=
   */
  @Get()
  async listOrders(@Req() req: any, @Query() query: any) {
    return this.orderService.listOrders(req.user.id, {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 20,
      status: query.status as OrderStatus,
      type: query.type as OrderType,
    });
  }

  /**
   * 创建订单
   * POST /api/orders
   */
  @Post()
  async createOrder(@Req() req: any, @Body() dto: any) {
    return this.orderService.createOrder(req.user.id, dto);
  }

  /**
   * 获取订单详情
   * GET /api/orders/:id
   */
  @Get(':id')
  async getOrder(@Req() req: any, @Param('id') id: string) {
    return this.orderService.getOrder(req.user.id, id);
  }

  /**
   * 取消订单
   * PUT /api/orders/:id/cancel
   */
  @Put(':id/cancel')
  async cancelOrder(@Req() req: any, @Param('id') id: string) {
    return this.orderService.cancelOrder(req.user.id, id);
  }

  /**
   * 确认收货
   * PUT /api/orders/:id/confirm
   */
  @Put(':id/confirm')
  async confirmDelivery(@Req() req: any, @Param('id') id: string) {
    return this.orderService.confirmDelivery(req.user.id, id);
  }
}

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * 获取购物车
   * GET /api/cart
   */
  @Get()
  async getCart(@Req() req: any) {
    return this.orderService.getCart(req.user.id);
  }

  /**
   * 添加到购物车
   * POST /api/cart
   */
  @Post()
  async addToCart(@Req() req: any, @Body() data: any) {
    return this.orderService.addToCart(req.user.id, data);
  }

  /**
   * 更新购物车数量
   * PUT /api/cart/:id
   */
  @Put(':id')
  async updateCartItem(
    @Req() req: any,
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ) {
    return this.orderService.updateCartItem(req.user.id, id, quantity);
  }

  /**
   * 删除购物车商品
   * DELETE /api/cart/:id
   */
  @Delete(':id')
  async removeFromCart(@Req() req: any, @Param('id') id: string) {
    return this.orderService.removeFromCart(req.user.id, id);
  }

  /**
   * 清空购物车
   * DELETE /api/cart
   */
  @Delete()
  async clearCart(@Req() req: any) {
    return this.orderService.clearCart(req.user.id);
  }
}
