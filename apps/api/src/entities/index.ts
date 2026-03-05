/** @format */

// ============================================
// 盲盒系统 - 数据库实体定义
// ============================================

// 用户相关
export { User, UserStatus } from './user.entity';
export { UserAddress } from './user-address.entity';
export { UserAccount, AccountType } from './user-account.entity';
export { UserLevel } from './user-level.entity';

// 商品相关
export { Product } from './product.entity';
export { ProductSku } from './product-sku.entity';
export { ProductCategory } from './product-category.entity';
export { ProductImage } from './product-image.entity';

// 一番赏
export { Ichiban, IchibanStatus } from './ichiban.entity';
export { IchibanPool } from './ichiban-pool.entity';
export { IchibanQueue } from './ichiban-queue.entity';
export { IchibanDraw } from './ichiban-draw.entity';

// 爬塔
export { Tower, TowerStatus } from './tower.entity';
export { TowerLevel } from './tower-level.entity';
export { TowerAttempt } from './tower-attempt.entity';
export { TowerReward } from './tower-reward.entity';

// 扭蛋机
export { Gacha, GachaStatus } from './gacha.entity';
export { GachaSeries } from './gacha-series.entity';
export { GachaDraw } from './gacha-draw.entity';
export { Fragment } from './fragment.entity';
export { UserFragment } from './user-fragment.entity';

// 订单相关
export { Order, OrderStatus } from './order.entity';
export { OrderItem } from './order-item.entity';
export { Cart } from './cart.entity';
export { Logistics, LogisticsStatus } from './logistics.entity';

// 支付相关
export { Payment, PaymentStatus } from './payment.entity';
export { RechargeOrder, RechargeStatus } from './recharge-order.entity';
export { Transaction, TransactionType } from './transaction.entity';

// 分销相关
export { Distributor, DistributorStatus } from './distributor.entity';
export { Commission, CommissionStatus } from './commission.entity';
export { InviteCode } from './invite-code.entity';
export { DistributorLevel } from './distributor-level.entity';

// 其他
export { RecycleRecord } from './recycle-record.entity';
export { LuckyCoin } from './lucky-coin.entity';
export { SystemConfig } from './system-config.entity';
