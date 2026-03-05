/** @format */

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Payment, PaymentStatus, PaymentType } from '../../entities/payment.entity';
import { Order, OrderStatus } from '../../entities/order.entity';
import { UserAccount, AccountType } from '../../entities/user-account.entity';
import { Transaction } from '../../entities/transaction.entity';

interface CreatePaymentDto {
  orderId: string;
  type: PaymentType;
  // 微信支付额外参数
  openid?: string;
}

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(UserAccount)
    private userAccountRepository: Repository<UserAccount>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private dataSource: DataSource,
  ) {}

  /**
   * 生成支付流水号
   */
  private generateTradeNo(): string {
    const ts = Date.now().toString();
    const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `PAY${ts}${rand}`;
  }

  /**
   * 发起支付
   */
  async createPayment(userId: string, dto: CreatePaymentDto) {
    const order = await this.orderRepository.findOne({
      where: { id: dto.orderId, userId },
    });

    if (!order) throw new NotFoundException('订单不存在');
    if (order.status !== OrderStatus.PENDING_PAY) {
      throw new BadRequestException('订单状态不正确，无法支付');
    }

    // 余额支付
    if (dto.type === PaymentType.BALANCE) {
      return this.payWithBalance(userId, order);
    }

    // 微信支付 - 创建支付记录，返回调起参数
    if (dto.type === PaymentType.WECHAT) {
      return this.createWechatPayment(userId, order, dto.openid);
    }

    throw new BadRequestException('不支持的支付方式');
  }

  /**
   * 余额支付
   */
  private async payWithBalance(userId: string, order: Order) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 查找余额账户
      const account = await this.userAccountRepository.findOne({
        where: { userId, type: AccountType.BALANCE },
      });

      if (!account) throw new BadRequestException('账户不存在');
      if (Number(account.balance) < Number(order.payAmount)) {
        throw new BadRequestException('余额不足');
      }

      // 扣减余额
      await queryRunner.manager.update(UserAccount, account.id, {
        balance: Number(account.balance) - Number(order.payAmount),
        totalExpense: Number(account.totalExpense) + Number(order.payAmount),
      });

      // 创建支付记录
      const tradeNo = this.generateTradeNo();
      const payment = this.paymentRepository.create({
        orderId: order.id,
        userId,
        tradeNo,
        type: PaymentType.BALANCE,
        amount: order.payAmount,
        status: PaymentStatus.SUCCESS,
        paidAt: new Date(),
      });
      await queryRunner.manager.save(payment);

      // 更新订单状态
      await queryRunner.manager.update(Order, order.id, {
        status: OrderStatus.PAID,
        payType: 'balance',
        paidAt: new Date(),
        payTradeNo: tradeNo,
      });

      // 记录交易流水
      const transaction = this.transactionRepository.create({
        userId,
        serialNo: `TXN${Date.now()}`,
        type: 'consume' as any,
        accountType: 'balance',
        amount: -Number(order.payAmount),
        balanceBefore: Number(account.balance),
        balanceAfter: Number(account.balance) - Number(order.payAmount),
        description: `购买订单 ${order.orderNo}`,
        relatedOrderNo: order.orderNo,
      });
      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();

      return {
        success: true,
        paymentId: payment.id,
        tradeNo,
        type: 'balance',
        message: '支付成功',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 创建微信支付
   * 注：实际生产需要接入微信支付SDK
   * 当前返回模拟支付参数，待配置真实微信支付凭证后替换
   */
  private async createWechatPayment(userId: string, order: Order, openid?: string) {
    const tradeNo = this.generateTradeNo();

    // 创建待支付记录
    const payment = this.paymentRepository.create({
      orderId: order.id,
      userId,
      tradeNo,
      type: PaymentType.WECHAT,
      amount: order.payAmount,
      status: PaymentStatus.PENDING,
    });
    await this.paymentRepository.save(payment);

    // TODO: 调用真实微信支付API
    // const wxPayParams = await this.wxPay.unifiedOrder({...})
    // 当前返回模拟参数
    return {
      success: true,
      paymentId: payment.id,
      tradeNo,
      type: 'wechat',
      // 微信JSAPI支付调起参数（生产环境替换为真实签名）
      prepayParams: {
        appId: process.env.WECHAT_APP_ID || 'wx_demo',
        timeStamp: String(Math.floor(Date.now() / 1000)),
        nonceStr: Math.random().toString(36).substring(2),
        package: `prepay_id=mock_${tradeNo}`,
        signType: 'RSA',
        paySign: 'MOCK_SIGN',
      },
      message: '微信支付参数已生成（待配置真实商户信息）',
    };
  }

  /**
   * 微信支付回调处理
   */
  async handleWechatCallback(data: any) {
    // 验证签名（生产环境必须验证）
    // TODO: 微信支付V3签名验证

    const { out_trade_no, transaction_id, trade_state } = data;

    if (trade_state !== 'SUCCESS') {
      return { success: false };
    }

    const payment = await this.paymentRepository.findOne({
      where: { tradeNo: out_trade_no },
      relations: ['order'],
    });

    if (!payment || payment.status === PaymentStatus.SUCCESS) {
      return { success: true }; // 幂等处理
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 更新支付记录
      await queryRunner.manager.update(Payment, payment.id, {
        status: PaymentStatus.SUCCESS,
        thirdPartyNo: transaction_id,
        paidAt: new Date(),
        responseData: JSON.stringify(data),
      });

      // 更新订单状态
      await queryRunner.manager.update(Order, payment.orderId, {
        status: OrderStatus.PAID,
        paidAt: new Date(),
        payTradeNo: out_trade_no,
      });

      await queryRunner.commitTransaction();
      return { success: true };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 查询支付状态
   */
  async getPaymentStatus(userId: string, paymentId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId, userId },
    });

    if (!payment) throw new NotFoundException('支付记录不存在');

    return {
      paymentId: payment.id,
      tradeNo: payment.tradeNo,
      status: payment.status,
      amount: payment.amount,
      paidAt: payment.paidAt,
    };
  }

  /**
   * 充值余额（发起支付）
   */
  async recharge(userId: string, amount: number) {
    if (amount < 1) throw new BadRequestException('充值金额不能小于1元');

    const tradeNo = this.generateTradeNo();

    // TODO: 创建充值订单 + 对接微信支付
    return {
      success: true,
      tradeNo,
      amount,
      message: '充值功能待接入微信支付',
    };
  }
}
