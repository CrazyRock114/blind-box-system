#!/bin/bash
# Vercel 部署脚本

# 进入 API 目录并构建
cd apps/api
npm ci
npm run build
