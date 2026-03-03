/** @format */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// 配置
import { AppConfig } from './config/app.config';
import { DatabaseConfig } from './config/database.config';

// 实体
import * as entities from './entities';

// 模块
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { PaymentModule } from './modules/payment/payment.module';
import { BlindboxModule } from './modules/blindbox/blindbox.module';
import { DistributionModule } from './modules/distribution/distribution.module';
import { CommonModule } from './modules/common/common.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      load: [AppConfig, DatabaseConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // 数据库模块
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: Object.values(entities),
        synchronize: configService.get('database.synchronize') === 'true',
        logging: configService.get('database.logging') === 'true',
      }),
    }),

    // 业务模块
    CommonModule,
    UserModule,
    ProductModule,
    OrderModule,
    PaymentModule,
    BlindboxModule,
    DistributionModule,
  ],
})
export class AppModule {}
