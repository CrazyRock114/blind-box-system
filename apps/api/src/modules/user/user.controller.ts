/** @format */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// DTOs
class UpdateProfileDto {
  nickname?: string;
  avatar?: string;
}

class CreateAddressDto {
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  zipCode?: string;
  isDefault?: boolean;
}

class UpdateAddressDto {
  name?: string;
  phone?: string;
  province?: string;
  city?: string;
  district?: string;
  address?: string;
  zipCode?: string;
  isDefault?: boolean;
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ==================== 用户资料 ====================

  /**
   * 获取当前用户资料
   */
  @Get('me')
  async getProfile(@Req() req: any) {
    return this.userService.getProfile(req.user.id);
  }

  /**
   * 更新用户资料
   */
  @Put('me')
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.id, dto);
  }

  // ==================== 地址管理 ====================

  /**
   * 获取所有收货地址
   */
  @Get('me/addresses')
  async getAddresses(@Req() req: any) {
    return this.userService.getAddresses(req.user.id);
  }

  /**
   * 获取单个地址
   */
  @Get('me/addresses/:id')
  async getAddressById(@Req() req: any, @Param('id') id: string) {
    return this.userService.getAddressById(req.user.id, id);
  }

  /**
   * 创建收货地址
   */
  @Post('me/addresses')
  async createAddress(@Req() req: any, @Body() dto: CreateAddressDto) {
    return this.userService.createAddress(req.user.id, dto);
  }

  /**
   * 更新收货地址
   */
  @Put('me/addresses/:id')
  async updateAddress(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.userService.updateAddress(req.user.id, id, dto);
  }

  /**
   * 删除收货地址
   */
  @Delete('me/addresses/:id')
  async deleteAddress(@Req() req: any, @Param('id') id: string) {
    await this.userService.deleteAddress(req.user.id, id);
    return { success: true };
  }

  /**
   * 设置默认地址
   */
  @Put('me/addresses/:id/default')
  async setDefaultAddress(@Req() req: any, @Param('id') id: string) {
    return this.userService.setDefaultAddress(req.user.id, id);
  }

  // ==================== 账户余额 ====================

  /**
   * 获取账户余额
   */
  @Get('me/account')
  async getAccount(@Req() req: any) {
    return this.userService.getAccount(req.user.id);
  }
}
