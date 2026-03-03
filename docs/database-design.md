# 盲盒系统 - 数据库设计文档

## 📊 数据库概览

数据库名称: `blindbox_db`
字符集: `utf8mb4_unicode_ci`

## 🗂️ 实体清单 (共 40+ 张表)

### 1. 用户模块 (User Module)

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| `users` | 用户表 | phone, password, openid, inviteCode, parentId |
| `user_addresses` | 用户地址 | userId, name, phone, province, city, address |
| `user_accounts` | 用户账户 | userId, type(balance/lucky_coin/points), balance |
| `user_levels` | 用户等级 | name, level, requiredValue, discount |

### 2. 商品模块 (Product Module)

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| `products` | 商品表 | name, code, type, status, price, stock |
| `product_categories` | 商品分类 | name, parentId, sort |
| `product_skus` | SKU表 | productId, name, price, probability, rarity |
| `product_images` | 商品图片 | productId, url, sort |
| `carts` | 购物车 | userId, productId, skuId, quantity |

### 3. 一番赏 (Ichiban)

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| `ichibans` | 一番赏活动 | name, price, totalTickets, remainingTickets, status |
| `ichiban_pools` | 奖池配置 | ichibanId, level, name, quantity, remaining, isLast |
| `ichiban_queues` | 排队记录 | ichibanId, userId, queueNumber, status |
| `ichiban_draws` | 抽赏记录 | ichibanId, userId, poolId, level, ticketNumber |

### 4. 爬塔 (Tower)

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| `towers` | 爬塔活动 | name, price, totalLevels, failDropEnabled |
| `tower_levels` | 关卡配置 | towerId, level, successRate, rewardName, isGuaranteed |
| `tower_attempts` | 挑战记录 | towerId, userId, currentLevel, maxLevel, status |
| `tower_rewards` | 奖励记录 | attemptId, level, rewardName, isSuccess |

### 5. 扭蛋机 (Gacha)

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| `gachas` | 扭蛋机 | name, price, tenDrawDiscount, pityCount |
| `gacha_series` | 系列配置 | gachaId, name, rarity, probability, fragmentCount |
| `gacha_draws` | 抽卡记录 | gachaId, userId, seriesId, rarity, isPity |
| `fragments` | 碎片配置 | name, requiredCount, exchangeProductId |
| `user_fragments` | 用户碎片 | userId, fragmentId, count, exchanged |

### 6. 订单模块 (Order)

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| `orders` | 订单表 | orderNo, userId, type, status, totalAmount, payAmount |
| `order_items` | 订单商品 | orderId, productId, skuId, quantity, unitPrice, status |
| `logistics` | 物流信息 | orderId, company, trackingNo, status, traces |
| `recycle_records` | 回收记录 | userId, orderItemId, recyclePoints, status |

### 7. 支付模块 (Payment)

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| `payments` | 支付记录 | orderId, tradeNo, type, amount, status |
| `recharge_orders` | 充值订单 | userId, orderNo, amount, bonus, status |
| `transactions` | 交易流水 | userId, type, amount, balanceBefore, balanceAfter |
| `lucky_coins` | 幸运币记录 | userId, type, amount, balanceBefore, balanceAfter |

### 8. 分销模块 (Distribution)

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| `distributors` | 分销商 | userId, parentId, inviteCode, level, totalCommission |
| `distributor_levels` | 分销等级 | level, directRate, indirectRate, teamRate |
| `commissions` | 佣金记录 | distributorId, orderId, amount, level, rate |
| `invite_codes` | 邀请码 | code, ownerId, status |

### 9. 系统配置

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| `system_configs` | 系统配置 | configKey, configValue, valueType |

## 🔗 核心关联关系

```
User (1) ──────── (*) UserAddress
User (1) ──────── (*) UserAccount
User (1) ──────── (*) Order
User (1) ──────── (*) Cart
User (1) ──────── (*) Distributor

Product (1) ───── (*) ProductSku
Product (1) ───── (*) ProductImage
ProductCategory (1) ── (*) ProductCategory (self)

Ichiban (1) ───── (*) IchibanPool
Ichiban (1) ───── (*) IchibanQueue
Ichiban (1) ───── (*) IchibanDraw
IchibanPool (1) ── (*) IchibanDraw

Tower (1) ─────── (*) TowerLevel
Tower (1) ─────── (*) TowerAttempt
TowerAttempt (1) ─ (*) TowerReward

Gacha (1) ─────── (*) GachaSeries
Gacha (1) ─────── (*) GachaDraw
GachaSeries (1) ── (*) GachaDraw

Order (1) ─────── (*) OrderItem
Order (1) ─────── (*) Logistics
Order (1) ─────── (*) Payment
Order (1) ─────── (*) Commission

Distributor (1) ── (*) Distributor (parent-child)
Distributor (1) ── (*) Commission
```

## 📝 关键业务规则

### 双货币系统
- **余额**: 充值获得，可用于购买
- **幸运币**: 签到/任务/分享获得，可用于特定玩法
- **积分**: 回收获得，可兑换商品

### 概率引擎
- SKU概率: `probability` 字段 (0-1)
- 扭蛋稀有度: N/R/SR/SSR/UR/LR
- 爬塔成功率: `successRate` 字段

### 分销层级
- 直推佣金: `directRate` (默认10%)
- 间推佣金: `indirectRate` (默认5%)
- 团队佣金: `teamRate` (合伙人专享)

### 回收机制
- 回收折扣率: `recycleRate` (默认70%)
- 回收所得: 积分

## 🔐 索引设计

```sql
-- 用户模块
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_invite_code ON users(inviteCode);
CREATE INDEX idx_users_parent_id ON users(parentId);

-- 订单模块
CREATE INDEX idx_orders_user_id ON orders(userId);
CREATE INDEX idx_orders_order_no ON orders(orderNo);
CREATE INDEX idx_orders_status ON orders(status);

-- 分销模块
CREATE INDEX idx_distributors_user_id ON distributors(userId);
CREATE INDEX idx_distributors_parent_id ON distributors(parentId);
CREATE INDEX idx_commissions_distributor_id ON commissions(distributorId);
```

## 🚀 初始化数据

系统启动时会自动创建以下默认数据：

1. **系统配置**: 应用名称、开关配置、比例配置等
2. **用户等级**: 普通/青铜/白银/黄金/铂金会员
3. **分销等级**: 普通分销商/高级分销商/合伙人
4. **商品分类**: 一番赏/爬塔/扭蛋/手办/周边
