-- 盲盒系统数据库初始化脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS blindbox_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE blindbox_db;

-- 初始化系统配置
INSERT INTO system_configs (config_key, config_value, config_name, description, value_type) VALUES
-- 基础配置
('app_name', '壹软盲盒', '应用名称', '系统显示名称', 'string'),
('app_logo', '/assets/logo.png', '应用Logo', '系统Logo路径', 'string'),

-- 一番赏配置
('ichiban_enabled', 'true', '一番赏开关', '是否开启一番赏功能', 'boolean'),
('ichiban_queue_timeout', '300', '排队超时时间', '一番赏排队超时时间（秒）', 'number'),
('ichiban_draw_timeout', '60', '抽赏超时时间', '一番赏抽赏超时时间（秒）', 'number'),

-- 爬塔配置
('tower_enabled', 'true', '爬塔开关', '是否开启爬塔功能', 'boolean'),
('tower_default_fail_drop', 'true', '默认失败掉落', '爬塔默认失败是否掉落', 'boolean'),

-- 扭蛋配置
('gacha_enabled', 'true', '扭蛋开关', '是否开启扭蛋功能', 'boolean'),
('gacha_default_pity', '100', '默认保底次数', '扭蛋默认保底次数', 'number'),
('gacha_ten_discount', '95', '十连折扣', '扭蛋十连折扣百分比', 'number'),
('fragment_enabled', 'true', '碎片系统开关', '是否开启碎片系统', 'boolean'),

-- 支付配置
('min_recharge_amount', '10', '最小充值金额', '最小充值金额（元）', 'number'),
('recharge_bonus_rate', '0', '充值赠送比例', '充值赠送比例', 'number'),

-- 回收配置
('recycle_enabled', 'true', '回收功能开关', '是否开启在线回收', 'boolean'),
('recycle_rate', '0.7', '回收折扣率', '回收折扣率（0-1）', 'number'),

-- 分销配置
('distribution_enabled', 'true', '分销开关', '是否开启分销功能', 'boolean'),
('direct_commission_rate', '0.1', '直推佣金比例', '直推佣金比例（0-1）', 'number'),
('indirect_commission_rate', '0.05', '间推佣金比例', '间推佣金比例（0-1）', 'number'),
('commission_settle_days', '7', '佣金结算天数', '订单完成后多少天结算佣金', 'number'),

-- 用户等级配置
('user_level_enabled', 'true', '用户等级开关', '是否开启用户等级系统', 'boolean'),

-- 幸运币配置
('lucky_coin_sign_reward', '10', '签到奖励', '每日签到奖励幸运币数量', 'number'),
('lucky_coin_share_reward', '5', '分享奖励', '每日分享奖励幸运币数量', 'number');

-- 初始化用户等级
INSERT INTO user_levels (name, level, required_value, discount, benefits, is_active) VALUES
('普通会员', 1, 0, 1.00, '{"free_shipping": false}', true),
('青铜会员', 2, 100, 0.98, '{"free_shipping": false}', true),
('白银会员', 3, 500, 0.95, '{"free_shipping": true}', true),
('黄金会员', 4, 2000, 0.90, '{"free_shipping": true}', true),
('铂金会员', 5, 10000, 0.85, '{"free_shipping": true, "priority_service": true}', true);

-- 初始化分销商等级
INSERT INTO distributor_levels (name, level, direct_rate, indirect_rate, team_rate, upgrade_amount, upgrade_direct_count, is_active) VALUES
('普通分销商', 1, 0.10, 0.00, 0.00, 0, 0, true),
('高级分销商', 2, 0.15, 0.05, 0.00, 1000, 5, true),
('合伙人', 3, 0.20, 0.08, 0.03, 5000, 20, true);

-- 初始化商品分类
INSERT INTO product_categories (name, icon, parent_id, sort, is_active) VALUES
('一番赏', '/category/ichiban.png', NULL, 1, true),
('爬塔', '/category/tower.png', NULL, 2, true),
('扭蛋', '/category/gacha.png', NULL, 3, true),
('手办', '/category/figure.png', NULL, 4, true),
('周边', '/category/goods.png', NULL, 5, true);
