# Vercel 手动部署步骤

## 紧急修复操作指南

由于无法直接访问 Vercel CLI，请按以下步骤手动重新部署：

### 步骤1: 登录 Vercel Dashboard
1. 访问 https://vercel.com/login
2. 使用 GitHub 账号登录
3. 进入 Dashboard: https://vercel.com/dashboard

### 步骤2: 重新部署后端 (blindbox-api)

1. 在 Dashboard 中找到 `blindbox-api` 项目
2. 点击进入项目
3. 找到 **Deployments** 标签
4. 查看最新部署状态
5. 点击 **Redeploy** 按钮（如果没有自动部署最新代码）

或者：
1. 进入项目设置
2. 点击 **Git** 标签
3. 确认 Connected Git Repository 是 `CrazyRock114/blind-box-system`
4. 点击 **Deploy** 手动触发部署

### 步骤3: 验证后端部署

部署完成后（约1-2分钟），测试以下链接：

```bash
# 健康检查
curl https://blindbox-backend.vercel.app/health

# 商品列表（应该返回商品数据，而不是健康检查）
curl https://blindbox-backend.vercel.app/api/products

# 分类列表
curl https://blindbox-backend.vercel.app/api/categories
```

**期望结果**:
- `/api/products` 应该返回商品列表，而不是 `{"success": true, "message": "盲盒后端服务运行正常"...}`

### 步骤4: 检查构建日志

如果部署失败：
1. 在 Deployment 页面点击最新的部署
2. 查看 **Build Logs**
3. 检查是否有错误信息

### 步骤5: 重新部署前端（如需要）

如果前端项目 `blind-box-deploy` 是独立项目：
1. 在 Dashboard 中找到前端项目
2. 同样点击 **Redeploy**

## 环境变量配置

确保后端项目配置了以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NODE_ENV` | `production` | 生产环境 |
| `DATABASE_URL` | (你的数据库URL) | PostgreSQL 连接字符串 |
| `JWT_SECRET` | (随机字符串) | JWT 签名密钥 |
| `CORS_ORIGIN` | `https://blind-box-deploy.vercel.app` | 允许的前端域名 |

设置方法：
1. 进入项目 Settings
2. 点击 **Environment Variables**
3. 添加上述变量
4. 重新部署

## 故障排除

### 问题: 部署后API仍然返回健康检查

**原因**: Vercel 可能还在使用旧的构建缓存

**解决**:
1. 在 Deployment 页面点击 **Redeploy** 时选择 **Use existing Build Cache: No**
2. 或者修改任意文件（如添加一个空格）触发新的构建

### 问题: 构建失败

**检查**:
1. 查看 Build Logs 中的错误信息
2. 确保 `api/simple.ts` 文件存在
3. 确保 `@vercel/node` 包已安装

### 问题: 前端无法连接后端

**检查**:
1. 确认后端 CORS 配置正确
2. 检查前端 `.env.production` 中的 `VITE_API_URL` 是否正确
3. 确认前端重新部署获取了最新配置

## 联系支持

如果以上步骤无法解决问题，请提供：
1. Vercel Build Logs 截图
2. 浏览器控制台错误信息
3. Network 标签中的 API 请求响应
