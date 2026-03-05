-- 盲盒系统数据库初始化脚本
-- 适用于 PostgreSQL (Supabase)
-- 执行顺序: 先创建枚举类型，再创建表

-- ============================================
-- 1. 创建枚举类型
-- ============================================

-- 用户状态枚举
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'banned');

-- 订单状态枚举
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded');

-- 支付状态枚举
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed', 'refunded');

-- 支付渠道枚举
CREATE TYPE payment_channel AS ENUM ('wechat', 'alipay', 'balance');

-- ============================================
-- 2. 创建用户相关表
-- ============================================

-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE,
    password VARCHAR(100),
    nickname VARCHAR(50) DEFAULT '',
    avatar VARCHAR(255),
    openid VARCHAR(50) DEFAULT '',
    unionid VARCHAR(50) DEFAULT '',
    invite_code VARCHAR(20) UNIQUE,
    parent_id UUID REFERENCES users(id),
    level INTEGER DEFAULT 0,
    status user_status DEFAULT 'active',
    last_login_at TIMESTAMP,
    last_login_ip VARCHAR(50) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 用户账户表（余额）
CREATE TABLE user_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(10, 2) DEFAULT 0,
    frozen_balance DECIMAL(10, 2) DEFAULT 0,
    total_recharge DECIMAL(10, 2) DEFAULT 0,
    total_consume DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户收货地址表
CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    province VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    address VARCHAR(255) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. 创建商品相关表
-- ============================================

-- 商品分类表
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 商品表
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES product_categories(id),
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    cover_image VARCHAR(255),
    images JSONB DEFAULT '[]',
    stock INTEGER DEFAULT 0,
    sold_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. 创建订单相关表
-- ============================================

-- 订单表
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_no VARCHAR(32) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    pay_amount DECIMAL(10, 2) NOT NULL,
    status order_status DEFAULT 'pending',
    address_id UUID,
    remark TEXT,
    paid_at TIMESTAMP,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 订单商品表
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    product_name VARCHAR(100) NOT NULL,
    product_image VARCHAR(255),
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. 创建支付相关表
-- ============================================

-- 支付记录表
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_no VARCHAR(32) UNIQUE NOT NULL,
    order_id UUID REFERENCES orders(id),
    user_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    channel payment_channel NOT NULL,
    status payment_status DEFAULT 'pending',
    transaction_id VARCHAR(100),
    paid_at TIMESTAMP,
    notify_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 充值订单表
CREATE TABLE recharge_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_no VARCHAR(32) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    give_amount DECIMAL(10, 2) DEFAULT 0,
    status payment_status DEFAULT 'pending',
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 交易记录表
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(20) NOT NULL, -- recharge, consume, refund, commission
    amount DECIMAL(10, 2) NOT NULL,
    balance DECIMAL(10, 2) NOT NULL,
    description VARCHAR(255),
    order_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. 创建索引
-- ============================================

-- 用户表索引
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_invite_code ON users(invite_code);
CREATE INDEX idx_users_parent_id ON users(parent_id);
CREATE INDEX idx_users_created_at ON users(created_at);

-- 订单表索引
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- 支付表索引
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================
-- 7. 插入初始数据
-- ============================================

-- 默认商品分类
INSERT INTO product_categories (name, icon, sort_order) VALUES
('热门推荐', '🔥', 1),
('新品上市', '✨', 2),
('一番赏', '🎁', 3),
('手办模型', '🤖', 4),
('毛绒玩具', '🧸', 5);

-- 系统配置表
CREATE TABLE system_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(50) UNIQUE NOT NULL,
    value TEXT,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 初始配置
INSERT INTO system_configs (key, value, description) VALUES
('site_name', '盲盒星球', '网站名称'),
('site_logo', '', '网站Logo'),
('customer_service_phone', '400-xxx-xxxx', '客服电话'),
('withdraw_min_amount', '100', '最小提现金额'),
('commission_rate', '10', '分销佣金比例%');
