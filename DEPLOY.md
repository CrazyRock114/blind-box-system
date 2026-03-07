# Vercel 部署指南

## 项目结构

- 后端: `/api` - NestJS API 服务
- 前端: `/web` - React + Vite 前端

## 部署配置

### 后端部署 (blindbox-backend.vercel.app)

1. 在 Vercel Dashboard 中导入 GitHub 仓库
2. 配置项目根目录: `./` (根目录)
3. 构建命令: `cd apps/api && npm install && npm run build`
4. 输出目录: `apps/api/dist`
5. 环境变量:
   - `NODE_ENV`: production
   - `DATABASE_URL`: (你的 PostgreSQL 数据库 URL)
   - `JWT_SECRET`: (JWT 密钥)
   - `CORS_ORIGIN`: https://blind-box-deploy.vercel.app

### 前端部署 (blind-box-deploy.vercel.app)

1. 在 Vercel Dashboard 中导入同一个 GitHub 仓库
2. 配置项目根目录: `./web`
3. 构建命令: `npm run build`
4. 输出目录: `dist`
5. 环境变量:
   - `VITE_API_URL`: https://blindbox-backend.vercel.app/api

## 修复的问题

### 后端问题
- 修复了 `api/index.ts` 中的模块导入路径问题
- 更新了 `vercel.json` 路由配置

### 前端问题
- 添加了缺失的 `index.html`
- 添加了 `tsconfig.app.json` 和 `tsconfig.node.json`
- 修复了 TypeScript 类型导入问题
- 添加了生产环境配置 `.env.production`

## 验证链接

- 前端: https://blind-box-deploy.vercel.app
- 后端: https://blindbox-backend.vercel.app/api/health
