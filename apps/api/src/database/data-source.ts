/** @format */

import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// 实体 - 手动导入所有实体类
import { User } from '../entities/user.entity';
import { UserAddress } from '../entities/user-address.entity';
import { UserAccount } from '../entities/user-account.entity';
import { UserLevel } from '../entities/user-level.entity';
import { Product } from '../entities/product.entity';
import { ProductSku } from '../entities/product-sku.entity';
import { ProductCategory } from '../entities/product-category.entity';
import { ProductImage } from '../entities/product-image.entity';
import { Ichiban } from '../entities/ichiban.entity';
import { IchibanPool } from '../entities/ichiban-pool.entity';
import { IchibanQueue } from '../entities/ichiban-queue.entity';
import { IchibanDraw } from '../entities/ichiban-draw.entity';
import { Tower } from '../entities/tower.entity';
import { TowerLevel } from '../entities/tower-level.entity';
import { TowerAttempt } from '../entities/tower-attempt.entity';
import { TowerReward } from '../entities/tower-reward.entity';
import { Gacha } from '../entities/gacha.entity';
import { GachaSeries } from '../entities/gacha-series.entity';
import { GachaDraw } from '../entities/gacha-draw.entity';
import { Fragment } from '../entities/fragment.entity';
import { UserFragment } from '../entities/user-fragment.entity';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Cart } from '../entities/cart.entity';
import { Logistics } from '../entities/logistics.entity';
import { Payment } from '../entities/payment.entity';
import { RechargeOrder } from '../entities/recharge-order.entity';
import { Transaction } from '../entities/transaction.entity';
import { Distributor } from '../entities/distributor.entity';
import { Commission } from '../entities/commission.entity';
import { InviteCode } from '../entities/invite-code.entity';
import { DistributorLevel } from '../entities/distributor-level.entity';
import { RecycleRecord } from '../entities/recycle-record.entity';
import { LuckyCoin } from '../entities/lucky-coin.entity';
import { SystemConfig } from '../entities/system-config.entity';

dotenv.config();

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

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'blindbox_db',
  entities: entities,
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'migrations',
});
