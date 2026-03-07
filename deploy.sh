#!/bin/bash
# Vercel 部署脚本
# 使用方法: ./deploy.sh [frontend|backend|all]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== 盲盒系统 Vercel 部署脚本 ===${NC}"

# 检查参数
DEPLOY_TARGET=${1:-all}

# 部署后端
deploy_backend() {
    echo -e "${YELLOW}>>> 部署后端...${NC}"
    
    # 检查 Vercel Token
    if [ -z "$VERCEL_TOKEN" ]; then
        echo -e "${RED}错误: 请设置 VERCEL_TOKEN 环境变量${NC}"
        echo "获取方式: https://vercel.com/account/tokens"
        exit 1
    fi
    
    # 部署到 Vercel
    npx vercel --token="$VERCEL_TOKEN" --prod --yes \
        --project-id="prj_77COz9wA8aQIYI0rnxzEnOzXUTuL" \
        --org-id="team_MsgORmY0Lpw5eOAGGbcUfBqT"
    
    echo -e "${GREEN}后端部署完成!${NC}"
    echo "访问地址: https://blindbox-backend.vercel.app"
}

# 部署前端
deploy_frontend() {
    echo -e "${YELLOW}>>> 部署前端...${NC}"
    
    # 检查 Vercel Token
    if [ -z "$VERCEL_TOKEN" ]; then
        echo -e "${RED}错误: 请设置 VERCEL_TOKEN 环境变量${NC}"
        exit 1
    fi
    
    # 进入前端目录
    cd web
    
    # 安装依赖
    npm install
    
    # 构建
    npm run build
    
    # 部署到 Vercel (需要单独的前端项目ID)
    # npx vercel --token="$VERCEL_TOKEN" --prod --yes
    
    echo -e "${GREEN}前端构建完成!${NC}"
    echo "请手动部署 dist 目录到 Vercel"
    
    cd ..
}

# 验证部署
verify_deployment() {
    echo -e "${YELLOW}>>> 验证部署...${NC}"
    
    echo "测试后端健康检查..."
    curl -s https://blindbox-backend.vercel.app/health | head -20
    
    echo ""
    echo "测试后端API..."
    curl -s https://blindbox-backend.vercel.app/api/products | head -20
    
    echo ""
    echo "测试前端..."
    curl -s -I https://blind-box-deploy.vercel.app | head -5
}

# 主逻辑
case $DEPLOY_TARGET in
    backend)
        deploy_backend
        ;;
    frontend)
        deploy_frontend
        ;;
    all)
        deploy_backend
        deploy_frontend
        verify_deployment
        ;;
    verify)
        verify_deployment
        ;;
    *)
        echo "用法: $0 [frontend|backend|all|verify]"
        echo ""
        echo "选项:"
        echo "  frontend - 只部署前端"
        echo "  backend  - 只部署后端"
        echo "  all      - 部署前后端并验证 (默认)"
        echo "  verify   - 只验证部署状态"
        exit 1
        ;;
esac

echo -e "${GREEN}=== 部署脚本执行完成 ===${NC}"
