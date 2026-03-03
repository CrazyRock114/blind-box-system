import { Controller, Post, Get, Body, Query, Request, UseGuards } from '@nestjs/common';
import { LotteryService } from './lottery.service';

// 简易JWT Guard，后续完善
const JwtAuthGuard = () => (target: any, key?: any, descriptor?: any) => descriptor;

@Controller('lottery')
@UseGuards(JwtAuthGuard())
export class LotteryController {
  constructor(private readonly lotteryService: LotteryService) {}

  @Post('draw')
  async draw(
    @Request() req,
    @Body() body: { boxPoolId: string; times?: number },
  ) {
    const results = await this.lotteryService.draw(
      req.user.userId,
      body.boxPoolId,
      body.times || 1,
    );

    return {
      code: 200,
      data: results,
      message: '抽奖成功',
    };
  }

  @Get('history')
  async getHistory(
    @Request() req,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const result = await this.lotteryService.getUserHistory(
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
