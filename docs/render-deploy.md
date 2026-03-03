# 盲盒系统 Render 部署文档

## 🚀 快速部署指南

### 1. 推送代码到 GitHub

```bash
# 确保代码已提交
git add .
git commit -m "feat: add render.yaml for Render deployment"
git push origin main
```

### 2. 在 Render 创建服务

1. 登录 [Render Dashboard](https://dashboard.render.com)
2. 点击 **New +** → **Blueprint**
3. 选择 GitHub 仓库：`blind-box-system`
4. 点击 **Apply** 开始部署

### 3. 配置环境变量

部署完成后，在 Render Dashboard 中设置以下环境变量：

#### API 服务 (blindbox-api)
| 变量名 | 说明 | 示例 |
|--------|------|------|
| `WECHAT_APP_ID` | 微信支付 AppID | wx1234567890 |
| `WECHAT_APP_SECRET` | 微信支付 AppSecret | your-secret-key |
| `WECHAT_MCH_ID` | 微信支付商户号 | 1234567890 |
| `WECHAT_MCH_KEY` | 微信支付 API 密钥 | your-mch-key |

> ⚠️ 注意：这些变量需要在 Render Dashboard 中手动设置，不要在代码中提交！

### 4. 服务访问地址

部署完成后，你将获得以下 URL：

| 服务 | URL 格式 | 用途 |
|------|----------|------|
| API | `https://blindbox-api.onrender.com` | 后端 API |
| 用户端 | `https://blindbox-web.onrender.com` | H5/小程序用户端 |
| 管理后台 | `https://blindbox-admin.onrender.com` | 运营后台 |

---

## 📋 部署架构

```
┌─────────────────────────────────────────────────────────────┐
│                        Render Platform                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  blindbox-web │  │ blindbox-api │  │blindbox-admin│      │
│  │   (Static)    │  │   (Node.js)  │  │   (Static)   │      │
│  │   用户端前端   │  │   后端 API   │  │   管理后台   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │              │
│         └─────────────────┴──────────────────┘              │
│                           │                                 │
│                    ┌──────┴──────┐                         │
│                    │  blindbox   │                         │
│                    │   -mysql    │                         │
│                    │  (MySQL 8)  │                         │
│                    └─────────────┘                         │
│                           │                                 │
│                    ┌──────┴──────┐                         │
│                    │  blindbox   │                         │
│                    │   -redis    │                         │
│                    │  (Redis 7)  │                         │
│                    └─────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 后端 | NestJS + TypeORM | 11.x |
| 数据库 | MySQL | 8.0 |
| 缓存 | Redis | 7.x |
| 用户端 | React + Vite + Antd Mobile | 19.x |
| 管理后台 | Vue 3 + Element Plus | 3.x |

---

## 🧪 测试账号

部署完成后，使用以下测试账号登录：

### 管理员账号
- 用户名：`admin`
- 密码：`admin123`

### 测试用户账号
- 手机号：`13800138000`
- 验证码：`123456` (开发模式)

---

## 📝 注意事项

1. **免费计划限制**：
   - 服务在 15 分钟无活动后会休眠
   - 首次访问可能需要等待 30 秒启动

2. **数据库**：
   - 使用 Render 托管的 MySQL
   - 数据库会自动创建表结构（`synchronize: true`）

3. **文件上传**：
   - 当前配置使用本地存储（`OSS_TYPE=local`）
   - 生产环境建议配置阿里云/腾讯云 OSS

4. **微信支付**：
   - 需要配置真实的微信支付参数
   - 回调地址已自动配置为 Render 服务地址

---

## 🆘 故障排查

### 服务启动失败
```bash
# 查看 API 服务日志
Render Dashboard → blindbox-api → Logs
```

### 数据库连接失败
- 检查 `DB_HOST`、`DB_PORT` 等环境变量
- 确认 MySQL 服务已启动

### 前端无法访问 API
- 检查 CORS 配置
- 确认 `VITE_API_BASE_URL` 环境变量正确

---

## 📚 相关文档

- [Render Blueprint 文档](https://render.com/docs/blueprint-spec)
- [NestJS 部署指南](https://docs.nestjs.com/deployment)
- [Render MySQL 文档](https://render.com/docs/mysql)

---

**部署日期**: 2026-03-03  
**版本**: v1.0.0  
**负责人**: 技术2号
