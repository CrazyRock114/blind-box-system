# 壹软网络盲盒系统 - 全功能版

## 🎯 项目概述

全功能盲盒系统，包含一番赏、爬塔、扭蛋机三大核心玩法，支持微信支付、分销返利等增值功能。

## 📁 项目结构

```
blind-box-system/
├── apps/
│   ├── api/              # NestJS 后端 API
│   ├── admin/            # Vue3 管理后台
│   └── web/              # Vue3/H5 用户端
├── packages/
│   └── shared/           # 共享类型和工具
├── docker/               # Docker 配置
├── docker-compose.yml    # Docker Compose 配置
└── package.json          # 根配置
```

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- MySQL >= 8.0
- Redis >= 7.0

### 安装依赖
```bash
npm install
```

### 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库和微信支付等参数
```

### 启动开发环境
```bash
# 启动数据库和 Redis
docker-compose up -d mysql redis

# 启动 API 服务
npm run dev:api
```

### Docker 部署
```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f api
```

## 📊 数据库设计

### 核心模块
- **用户模块**: users, user_addresses, user_accounts, user_levels
- **商品模块**: products, product_categories, product_skus
- **一番赏**: ichibans, ichiban_pools, ichiban_queues, ichiban_draws
- **爬塔**: towers, tower_levels, tower_attempts, tower_rewards
- **扭蛋机**: gachas, gacha_series, gacha_draws, fragments
- **订单模块**: orders, order_items, carts, logistics
- **支付模块**: payments, recharge_orders, transactions
- **分销模块**: distributors, commissions, invite_codes

## 🔧 技术栈

### 后端
- NestJS 11.x
- TypeORM 0.3.x
- MySQL 8.0
- Redis 7.x
- JWT 认证

### 前端
- Vue 3.x
- TypeScript
- Element Plus / Vant

## 📈 开发进度

- [x] Phase 1: 基础架构 + 数据库设计
- [ ] Phase 2: 概率引擎
- [ ] Phase 3: 一番赏
- [ ] Phase 4: 爬塔
- [ ] Phase 5: 扭蛋机 + 碎片系统
- [ ] Phase 6: 微信支付
- [ ] Phase 7: 分销返利
- [ ] Phase 8: 用户端前端
- [ ] Phase 9: 后台管理
- [ ] Phase 10: 测试优化

## 📄 许可证

ISC License
