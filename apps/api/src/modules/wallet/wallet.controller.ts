import { Controller, Get, Post, Body, Query, Request, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';

// 简易JWT Guard
const JwtAuthGuard = () => (target: any, key?: any, descriptor?: any) => descriptor;

@Controller('wallet')
@UseGuards(JwtAuthGuard())
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getWallet(@Request() req) {
    const wallet = await this.walletService.getWallet(req.user.userId);
    return {
      code: 200,
      data: wallet,
    };
  }

  @Get('transactions')
  async getTransactions(
    @Request() req,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const result = await this.walletService.getTransactions(
      req.user.userId,
      parseInt(page) || 1,
      parseInt(limit) || 20,
    );

    return {
      code: 200,
      data: result.data,
      meta: result.meta,
    };
  }
}
