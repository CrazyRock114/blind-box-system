/** @format */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserStatus } from '../../entities/user.entity';
import { UserAccount } from '../../entities/user-account.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserAccount)
    private userAccountRepository: Repository<UserAccount>,
    private jwtService: JwtService,
  ) {}

  /**
   * 用户注册
   */
  async register(phone: string, password: string, inviteCode?: string) {
    // 检查手机号是否已注册
    const existingUser = await this.userRepository.findOne({
      where: { phone },
    });

    if (existingUser) {
      throw new UnauthorizedException('手机号已注册');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 生成邀请码
    const userInviteCode = this.generateInviteCode();

    // 查找上级用户
    let parentId = null;
    if (inviteCode) {
      const parent = await this.userRepository.findOne({
        where: { inviteCode },
      });
      if (parent) {
        parentId = parent.id;
      }
    }

    // 创建用户
    const user = this.userRepository.create({
      phone,
      password: hashedPassword,
      nickname: `用户${phone.slice(-4)}`,
      inviteCode: userInviteCode,
      parentId,
      status: UserStatus.ACTIVE,
    });

    const savedUser = await this.userRepository.save(user);

    // 创建用户账户（余额账户）
    const userAccount = this.userAccountRepository.create({
      userId: savedUser.id,
      type: 'balance' as any,
      balance: 0,
      frozen: 0,
      totalIncome: 0,
      totalExpense: 0,
    });
    await this.userAccountRepository.save(userAccount);

    // 生成token
    const tokens = await this.generateTokens(savedUser);

    return {
      user: this.sanitizeUser(savedUser),
      ...tokens,
    };
  }

  /**
   * 用户登录
   */
  async login(phone: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { phone },
    });

    if (!user) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    if (user.status === UserStatus.BANNED) {
      throw new UnauthorizedException('账号已被封禁');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  /**
   * 刷新token
   */
  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('无效的token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('无效的refresh token');
    }
  }

  /**
   * 生成token
   */
  private async generateTokens(user: User) {
    const payload = { sub: user.id, phone: user.phone };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      expiresIn: '30d',
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '604800'), // 7天
    };
  }

  /**
   * 生成邀请码
   */
  private generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * 清理用户敏感信息
   */
  private sanitizeUser(user: User) {
    const { password, ...sanitized } = user as any;
    return sanitized;
  }

  /**
   * 验证用户
   */
  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId, status: UserStatus.ACTIVE },
    });
  }
}
