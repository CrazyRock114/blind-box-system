/** @format */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// 配置
import { AppConfig } from './config/app.config';
import { DatabaseConfig } from './config/database.config';

// 实体 - 手动导入所有实体类
import { User } from './entities/user.entity';
import { UserAddress } from './entities/user-address.entity';
import { UserAccount } from './entities/user-account.entity';
import { UserLevel } from './entities/user-level.entity';
import { Product } from './entities/product.entity';
import { ProductSku } from './entities/product-sku.entity';
import { ProductCategory } from './entities/product-category.entity';
import { ProductImage } from './entities/product-image.entity';
import { Ichiban } from './entities/ichiban.entity';
import { IchibanPool } from './entities/ichiban-pool.entity';
import { IchibanQueue } from './entities/ichiban-queue.entity';
import { IchibanDraw } from './entities/ichiban-draw.entity';
import { Tower } from './entities/tower.entity';
import { TowerLevel } from './entities/tower-level.entity';
import { TowerAttempt } from './entities/tower-attempt.entity';
import { TowerReward } from './entities/tower-reward.entity';
import { Gacha } from './entities/gacha.entity';
import { GachaSeries } from './entities/gacha-series.entity';
import { GachaDraw } from './entities/gacha-draw.entity';
import { Fragment } from './entities/fragment.entity';
import { UserFragment } from './entities/user-fragment.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Cart } from './entities/cart.entity';
import { Logistics } from './entities/logistics.entity';
import { Payment } from './entities/payment.entity';
import { RechargeOrder } from './entities/recharge-order.entity';
import { Transaction } from './entities/transaction.entity';
import { Distributor } from './entities/distributor.entity';
import { Commission } from './entities/commission.entity';
import { InviteCode } from './entities/invite-code.entity';
import { DistributorLevel } from './entities/distributor-level.entity';
import { RecycleRecord } from './entities/recycle-record.entity';
import { LuckyCoin } from './entities/lucky-coin.entity';
import { SystemConfig } from './entities/system-config.entity';

// 模块
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { PaymentModule } from './modules/payment/payment.module';
import { BlindboxModule } from './modules/blindbox/blindbox.module';
import { DistributionModule } from './modules/distribution/distribution.module';
import { CommonModule } from './modules/common/common.module';

const entities = [
  User, UserAddress, UserAccount, UserLevel,
  Product, ProductSku, ProductCategory, ProductImage,
  Ichiban, IchibanPool, IchibanQueue, IchibanDraw,
  Tower, TowerLevel, TowerAttempt, TowerReward,
  Gacha, GachaSeries, GachaDraw, Fragment, UserFragment,
  Order, OrderItem, Cart, Logistics,
  Payment, RechargeOrder, Transaction,
  Distributor, Commission, InviteCode, DistributorLevel,
  RecycleRecord, LuckyCoin, SystemConfig,
];

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      load: [AppConfig, DatabaseConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // 数据库模块 - 使用DATABASE_URL环境变量（Render提供PostgreSQL）
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // 优先使用DATABASE_URL环境变量（Render自动提供）
        const databaseUrl = process.env.DATABASE_URL;
        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: entities,
            synchronize: configService.get('database.synchronize') === 'true',
            logging: configService.get('database.logging') === 'true',
            ssl: {
              rejectUnauthorized: false, // Render PostgreSQL需要
            },
          };
        }
        // 本地开发回退到配置
        return {
          type: 'mysql',
          host: configService.get('database.host'),
          port: configService.get('database.port'),
          username: configService.get('database.username'),
          password: configService.get('database.password'),
          database: configService.get('database.name'),
          entities: entities,
          synchronize: configService.get('database.synchronize') === 'true',
          logging: configService.get('database.logging') === 'true',
        };
      },
    }),

    // 业务模块
    CommonModule,
    AuthModule,
    UserModule,
    ProductModule,
    OrderModule,
    PaymentModule,
    BlindboxModule,
    DistributionModule,
  ],
})
export class AppModule {}
