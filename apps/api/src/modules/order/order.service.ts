/** @format */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus, OrderType } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { Cart } from '../../entities/cart.entity';
import { UserAccount, AccountType } from '../../entities/user-account.entity';

interface CreateOrderDto {
  type: OrderType;
  items: Array<{
    productId: string;
    productName: string;
    productImage?: string;
    skuId?: string;
    skuName?: string;
    quantity: number;
    unitPrice: number;
  }>;
  remark?: string;
}

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    private dataSource: DataSource,
  ) {}

  /**
   * 生成订单编号
   */
  private generateOrderNo(): string {
    const date = new Date();
    const dateStr = date.getFullYear().toString() +
      String(date.getMonth() + 1).padStart(2, '0') +
      String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return `BB${dateStr}${random}`;
  }

  /**
   * 获取用户订单列表
   */
  async listOrders(userId: string, query: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    type?: OrderType;
  }) {
    const { page = 1, limit = 20, status, type } = query;

    const where: any = { userId };
    if (status) where.status = status;
    if (type) where.type = type;

    const [items, total] = await this.orderRepository.findAndCount({
      where,
      relations: ['items'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取订单详情
   */
  async getOrder(userId: string, orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    return order;
  }

  /**
   * 创建订单
   */
  async createOrder(userId: string, dto: CreateOrderDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 计算金额
      const totalAmount = dto.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity, 0
      );
      const totalCount = dto.items.reduce((sum, item) => sum + item.quantity, 0);

      // 创建订单
      const order = this.orderRepository.create({
        orderNo: this.generateOrderNo(),
        userId,
        type: dto.type,
        status: OrderStatus.PENDING_PAY,
        totalCount,
        totalAmount,
        discountAmount: 0,
        payAmount: totalAmount,
        remark: dto.remark,
      });

      const savedOrder = await queryRunner.manager.save(order);

      // 创建订单项
      for (const item of dto.items) {
        const orderItem = this.orderItemRepository.create({
          orderId: savedOrder.id,
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          skuId: item.skuId,
          skuName: item.skuName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity,
        });
        await queryRunner.manager.save(orderItem);
      }

      await queryRunner.commitTransaction();

      return this.getOrder(userId, savedOrder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 取消订单
   */
  async cancelOrder(userId: string, orderId: string) {
    const order = await this.getOrder(userId, orderId);

    if (order.status !== OrderStatus.PENDING_PAY) {
      throw new BadRequestException('只能取消待支付的订单');
    }

    await this.orderRepository.update(orderId, {
      status: OrderStatus.CANCELLED,
    });

    return { success: true };
  }

  /**
   * 确认收货
   */
  async confirmDelivery(userId: string, orderId: string) {
    const order = await this.getOrder(userId, orderId);

    if (order.status !== OrderStatus.SHIPPED) {
      throw new BadRequestException('订单状态不正确');
    }

    await this.orderRepository.update(orderId, {
      status: OrderStatus.COMPLETED,
    });

    return { success: true };
  }

  // ==================== 购物车 ====================

  /**
   * 获取购物车
   */
  async getCart(userId: string) {
    return this.cartRepository.find({
      where: { userId },
      relations: ['product', 'product.images'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 添加到购物车
   */
  async addToCart(userId: string, data: {
    productId: string;
    skuId?: string;
    quantity: number;
  }) {
    const existing = await this.cartRepository.findOne({
      where: {
        userId,
        productId: data.productId,
        ...(data.skuId ? { skuId: data.skuId } : {}),
      },
    });

    if (existing) {
      await this.cartRepository.update(existing.id, {
        quantity: existing.quantity + data.quantity,
      });
      return this.cartRepository.findOne({ where: { id: existing.id } });
    }

    const cartItem = this.cartRepository.create({
      userId,
      productId: data.productId,
      skuId: data.skuId,
      quantity: data.quantity,
    });

    return this.cartRepository.save(cartItem);
  }

  /**
   * 更新购物车
   */
  async updateCartItem(userId: string, cartId: string, quantity: number) {
    const item = await this.cartRepository.findOne({
      where: { id: cartId, userId },
    });

    if (!item) {
      throw new NotFoundException('购物车商品不存在');
    }

    if (quantity <= 0) {
      await this.cartRepository.remove(item);
      return { success: true };
    }

    await this.cartRepository.update(cartId, { quantity });
    return this.cartRepository.findOne({ where: { id: cartId } });
  }

  /**
   * 删除购物车商品
   */
  async removeFromCart(userId: string, cartId: string) {
    const item = await this.cartRepository.findOne({
      where: { id: cartId, userId },
    });

    if (!item) {
      throw new NotFoundException('购物车商品不存在');
    }

    await this.cartRepository.remove(item);
    return { success: true };
  }

  /**
   * 清空购物车
   */
  async clearCart(userId: string) {
    await this.cartRepository.delete({ userId });
    return { success: true };
  }
}
