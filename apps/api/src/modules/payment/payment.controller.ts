/** @format */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * 发起支付
   * POST /api/payment/create
   */
  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createPayment(@Req() req: any, @Body() dto: any) {
    return this.paymentService.createPayment(req.user.id, dto);
  }

  /**
   * 查询支付状态
   * GET /api/payment/:id/status
   */
  @Get(':id/status')
  @UseGuards(JwtAuthGuard)
  async getPaymentStatus(@Req() req: any, @Param('id') id: string) {
    return this.paymentService.getPaymentStatus(req.user.id, id);
  }

  /**
   * 余额充值
   * POST /api/payment/recharge
   */
  @Post('recharge')
  @UseGuards(JwtAuthGuard)
  async recharge(@Req() req: any, @Body('amount') amount: number) {
    return this.paymentService.recharge(req.user.id, amount);
  }

  /**
   * 微信支付异步回调
   * POST /api/payment/notify/wechat
   * 注意：此接口无需JWT认证，微信服务器调用
   */
  @Post('notify/wechat')
  async wechatCallback(@Body() data: any) {
    return this.paymentService.handleWechatCallback(data);
  }
}
