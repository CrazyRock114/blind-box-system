/**
 * 奖池热更新API控制器
 * Phase 2 - 热更新管理接口
 */

import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  UseGuards, 
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PoolConfigService } from '../config/pool-config.service';
import { GuaranteeRedisService } from '../guarantee/guarantee-redis.service';
import { HotUpdatePoolDTO, HotUpdatePrizeDTO } from '../guarantee/guarantee.types';

// 简易管理员Guard
const AdminGuard = () => (target: any, key?: any, descriptor?: any) => descriptor;

@Controller('admin/lottery')
@UseGuards(AdminGuard())
export class LotteryAdminController {
  private readonly logger = new Logger(LotteryAdminController.name);

  constructor(
    private readonly poolConfig: PoolConfigService,
    private readonly guaranteeRedis: GuaranteeRedisService,
  ) {}

  /**
   * 获取奖池当前配置
   */
  @Get('config/:boxPoolId')
  async getPoolConfig(@Param('boxPoolId') boxPoolId: string) {
    const config = await this.poolConfig.getPoolConfig(boxPoolId);
    
    if (!config) {
      throw new HttpException('奖池不存在', HttpStatus.NOT_FOUND);
    }

    // 验证配置合法性
    const validation = this.poolConfig.validateConfig(config);

    return {
      code: 200,
      data: config,
      validation,
    };
  }

  /**
   * 热更新奖池配置
   */
  @Post('config/:boxPoolId/update')
  async hotUpdateConfig(
    @Param('boxPoolId') boxPoolId: string,
    @Body() dto: HotUpdatePoolDTO,
  ) {
    try {
      // 验证DTO
      if (!dto.prizes && !dto.guarantees && !dto.algorithm) {
        throw new HttpException('至少需要更新一项配置', HttpStatus.BAD_REQUEST);
      }

      // 执行热更新
      const updatedConfig = await this.poolConfig.hotUpdatePoolConfig({
        ...dto,
        boxPoolId,
      });

      this.logger.log(`热更新成功: ${boxPoolId}, 版本: ${updatedConfig.version}`);

      return {
        code: 200,
        data: {
          boxPoolId,
          version: updatedConfig.version,
          updatedAt: updatedConfig.updatedAt,
          prizeCount: updatedConfig.prizes.length,
          guaranteeCount: updatedConfig.guarantees.length,
        },
        message: '配置更新成功',
      };
    } catch (error) {
      this.logger.error(`热更新失败: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 批量更新奖品概率/权重
   */
  @Post('config/:boxPoolId/prizes/batch')
  async batchUpdatePrizes(
    @Param('boxPoolId') boxPoolId: string,
    @Body() dto: { prizes: HotUpdatePrizeDTO[] },
  ) {
    if (!dto.prizes || dto.prizes.length === 0) {
      throw new HttpException('奖品列表不能为空', HttpStatus.BAD_REQUEST);
    }

    try {
      const updatedConfig = await this.poolConfig.hotUpdatePoolConfig({
        boxPoolId,
        prizes: dto.prizes,
      });

      return {
        code: 200,
        data: {
          boxPoolId,
          updatedPrizes: dto.prizes.map(p => p.prizeId),
          version: updatedConfig.version,
        },
        message: `成功更新 ${dto.prizes.length} 个奖品配置`,
      };
    } catch (error) {
      this.logger.error(`批量更新失败: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 刷新奖池配置（从数据库重新加载）
   */
  @Post('config/:boxPoolId/refresh')
  async refreshConfig(@Param('boxPoolId') boxPoolId: string) {
    try {
      const config = await this.poolConfig.refreshPoolConfig(boxPoolId);
      
      if (!config) {
        throw new HttpException('奖池不存在', HttpStatus.NOT_FOUND);
      }

      return {
        code: 200,
        data: {
          boxPoolId,
          version: config.version,
          refreshedAt: Date.now(),
        },
        message: '配置刷新成功',
      };
    } catch (error) {
      this.logger.error(`刷新失败: ${error.message}`);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 获取用户保底状态
   */
  @Get('guarantee/:boxPoolId/:userId')
  async getUserGuaranteeState(
    @Param('boxPoolId') boxPoolId: string,
    @Param('userId') userId: string,
  ) {
    const types = ['consecutive', 'level', 'global'] as const;
    const states = await this.guaranteeRedis.batchGetUserStates(userId, boxPoolId, types);

    const result: Record<string, any> = {};
    states.forEach((state, type) => {
      result[type] = {
        consecutiveCount: state.consecutiveCount,
        levelCounts: state.levelCounts,
        triggered: state.triggered,
        lastDrawTime: state.lastDrawTime,
      };
    });

    return {
      code: 200,
      data: {
        userId,
        boxPoolId,
        states: result,
      },
    };
  }

  /**
   * 重置用户保底状态
   */
  @Post('guarantee/:boxPoolId/:userId/reset')
  async resetUserGuarantee(
    @Param('boxPoolId') boxPoolId: string,
    @Param('userId') userId: string,
    @Body() dto: { type?: string },
  ) {
    const types = dto.type 
      ? [dto.type as any]
      : ['consecutive', 'level', 'global'];

    for (const type of types) {
      await this.guaranteeRedis.clearUserState(userId, boxPoolId, type);
    }

    this.logger.log(`重置用户保底状态: ${userId}, 奖池: ${boxPoolId}`);

    return {
      code: 200,
      message: `保底状态已重置: ${types.join(', ')}`,
    };
  }

  /**
   * 获取奖池统计信息
   */
  @Get('stats/:boxPoolId')
  async getPoolStats(@Param('boxPoolId') boxPoolId: string) {
    const stats = await this.guaranteeRedis.getPoolStats(boxPoolId);

    return {
      code: 200,
      data: {
        boxPoolId,
        ...stats,
      },
    };
  }

  /**
   * 批量刷新多个奖池
   */
  @Post('config/batch-refresh')
  async batchRefreshConfig(@Body() dto: { boxPoolIds: string[] }) {
    if (!dto.boxPoolIds || dto.boxPoolIds.length === 0) {
      throw new HttpException('奖池ID列表不能为空', HttpStatus.BAD_REQUEST);
    }

    await this.poolConfig.batchRefreshConfig(dto.boxPoolIds);

    return {
      code: 200,
      message: `成功刷新 ${dto.boxPoolIds.length} 个奖池配置`,
    };
  }

  /**
   * 验证配置合法性
   */
  @Post('config/:boxPoolId/validate')
  async validateConfig(@Param('boxPoolId') boxPoolId: string) {
    const config = await this.poolConfig.getPoolConfig(boxPoolId);
    
    if (!config) {
      throw new HttpException('奖池不存在', HttpStatus.NOT_FOUND);
    }

    const validation = this.poolConfig.validateConfig(config);

    return {
      code: 200,
      data: validation,
      message: validation.valid ? '配置合法' : '配置存在问题',
    };
  }
}
