# 🚀 盲盒系统 Render 部署 - 交付文档

## ✅ 部署状态：配置完成，待 Render 创建服务

---

## 📦 已交付内容

### 1. 配置文件
| 文件 | 说明 |
|------|------|
| `render.yaml` | Render Blueprint 配置，定义所有服务 |
| `.env.render.example` | 环境变量模板 |
| `docs/render-deploy.md` | 完整部署文档 |

### 2. 代码更新
- ✅ 添加健康检查端点 `/api/health`
- ✅ 更新数据库配置（自动同步表结构）
- ✅ 更新前端 API 客户端配置
- ✅ 所有更改已推送到 GitHub

---

## 🔧 Render 服务架构

```
┌────────────────────────────────────────────────────────────┐
│                    Render 平台                              │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────────┐    ┌─────────────────┐               │
│  │  blindbox-web   │    │ blindbox-admin  │               │
│  │   用户端前端     │    │   管理后台       │               │
│  │  (Static Site)  │    │  (Static Site)  │               │
│  │  React + Vite   │    │   Vue 3         │               │
│  └────────┬────────┘    └────────┬────────┘               │
│           │                      │                         │
│           └──────────┬───────────┘                         │
│                      │                                     │
│           ┌──────────▼───────────┐                         │
│           │    blindbox-api      │                         │
│           │     后端 API         │                         │
│           │   (Node.js Web)      │                         │
│           │    NestJS 11.x       │                         │
│           └──────────┬───────────┘                         │
│                      │                                     │
│      ┌───────────────┼───────────────┐                     │
│      │               │               │                     │
│  ┌───▼────┐    ┌────▼────┐    ┌─────▼────┐               │
│  │ MySQL  │    │  Redis  │    │  Health  │               │
│  │  8.0   │    │   7.x   │    │  Check   │               │
│  └────────┘    └─────────┘    └──────────┘               │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 🌐 服务访问地址（部署后）

| 服务 | 预计 URL | 用途 |
|------|----------|------|
| API | `https://blindbox-api.onrender.com` | 后端 API |
| 用户端 | `https://blindbox-web.onrender.com` | H5/小程序用户端 |
| 管理后台 | `https://blindbox-admin.onrender.com` | 运营后台 |

---

## 📋 部署步骤（总裁只需执行以下步骤）

### Step 1: 登录 Render
访问 https://dashboard.render.com 并登录

### Step 2: 创建 Blueprint 部署
1. 点击 **New +** → **Blueprint**
2. 选择 GitHub 仓库：`CrazyRock114/blind-box-system`
3. 点击 **Apply**

### Step 3: 配置微信支付（可选，测试时可跳过）
在 Render Dashboard 中设置以下环境变量：

| 变量名 | 值 |
|--------|-----|
| `WECHAT_APP_ID` | 你的微信支付 AppID |
| `WECHAT_APP_SECRET` | 你的微信支付 AppSecret |
| `WECHAT_MCH_ID` | 你的微信支付商户号 |
| `WECHAT_MCH_KEY` | 你的微信支付 API 密钥 |

> 💡 提示：没有微信支付可以先部署，后续再配置

### Step 4: 等待部署完成
- 首次部署约需 3-5 分钟
- 可以在 Render Dashboard 查看实时日志

---

## 🧪 测试账号

部署完成后，使用以下账号测试：

### 管理员账号
- 用户名：`admin`
- 密码：`admin123`
- 登录地址：`https://blindbox-admin.onrender.com`

### 测试用户
- 手机号：`13800138000`
- 验证码：`123456`（开发模式）
- 访问地址：`https://blindbox-web.onrender.com`

---

## ⚠️ 重要提示

### 免费计划限制
- 服务 15 分钟无活动后会休眠
- 首次访问可能需要等待 30 秒启动
- 如需 24/7 运行，请升级到付费计划

### 数据库
- 使用 Render 托管的 MySQL（免费计划）
- 数据库表结构会自动创建（`synchronize: true`）
- 生产环境建议关闭自动同步，使用迁移脚本

### 文件上传
- 当前使用本地存储（重启后丢失）
- 生产环境建议配置阿里云/腾讯云 OSS

---

## 📚 相关链接

- **GitHub 仓库**: https://github.com/CrazyRock114/blind-box-system
- **Render Dashboard**: https://dashboard.render.com
- **部署文档**: `docs/render-deploy.md`

---

## 🆘 故障排查

如果部署失败，请检查：
1. GitHub 仓库是否有 `render.yaml` 文件
2. Render 是否有权限访问 GitHub 仓库
3. 查看 Render Dashboard 中的构建日志

---

**交付时间**: 2026-03-03  
**技术负责人**: 技术2号  
**状态**: ✅ 配置完成，等待 Render 部署
