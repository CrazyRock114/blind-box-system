/** @format */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UserAddress } from '../../entities/user-address.entity';
import { UserAccount } from '../../entities/user-account.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserAddress)
    private addressRepository: Repository<UserAddress>,
    @InjectRepository(UserAccount)
    private accountRepository: Repository<UserAccount>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findById(id: string): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByPhone(phone: string): Promise<User> {
    return this.userRepository.findOne({ where: { phone } });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  /**
   * 获取用户资料（含地址和账户）
   */
  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['addresses', 'accounts'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const { password, ...profile } = user as any;
    return profile;
  }

  /**
   * 更新用户资料
   */
  async updateProfile(userId: string, data: Partial<User>) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 只允许更新特定字段
    const allowedFields = ['nickname', 'avatar'];
    const updateData: Partial<User> = {};
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    await this.userRepository.update(userId, updateData);
    return this.getProfile(userId);
  }

  // ==================== 地址管理 ====================

  /**
   * 获取用户所有地址
   */
  async getAddresses(userId: string): Promise<UserAddress[]> {
    return this.addressRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * 获取单个地址
   */
  async getAddressById(userId: string, addressId: string): Promise<UserAddress> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, userId },
    });
    
    if (!address) {
      throw new NotFoundException('地址不存在');
    }
    
    return address;
  }

  /**
   * 创建地址
   */
  async createAddress(userId: string, data: Partial<UserAddress>): Promise<UserAddress> {
    // 如果是第一个地址，设为默认
    const existingAddresses = await this.addressRepository.count({ where: { userId } });
    
    const address = this.addressRepository.create({
      ...data,
      userId,
      isDefault: existingAddresses === 0 ? true : (data.isDefault || false),
    });

    // 如果设为默认，取消其他默认地址
    if (address.isDefault) {
      await this.addressRepository.update(
        { userId, isDefault: true },
        { isDefault: false }
      );
    }

    return this.addressRepository.save(address);
  }

  /**
   * 更新地址
   */
  async updateAddress(
    userId: string,
    addressId: string,
    data: Partial<UserAddress>
  ): Promise<UserAddress> {
    const address = await this.getAddressById(userId, addressId);
    
    // 如果设为默认，取消其他默认地址
    if (data.isDefault && !address.isDefault) {
      await this.addressRepository.update(
        { userId, isDefault: true },
        { isDefault: false }
      );
    }

    await this.addressRepository.update(addressId, data);
    return this.getAddressById(userId, addressId);
  }

  /**
   * 删除地址
   */
  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const address = await this.getAddressById(userId, addressId);
    await this.addressRepository.remove(address);
  }

  /**
   * 设置默认地址
   */
  async setDefaultAddress(userId: string, addressId: string): Promise<UserAddress> {
    const address = await this.getAddressById(userId, addressId);
    
    // 取消其他默认地址
    await this.addressRepository.update(
      { userId, isDefault: true },
      { isDefault: false }
    );

    // 设置当前为默认
    await this.addressRepository.update(addressId, { isDefault: true });
    
    return this.getAddressById(userId, addressId);
  }

  // ==================== 账户余额 ====================

  /**
   * 获取用户账户余额
   */
  async getAccount(userId: string): Promise<UserAccount> {
    const account = await this.accountRepository.findOne({
      where: { userId },
    });
    
    if (!account) {
      throw new NotFoundException('账户不存在');
    }
    
    return account;
  }
}
