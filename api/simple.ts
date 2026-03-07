// 简化版 Vercel Serverless Function 入口
// 这个文件直接处理所有请求，不使用 NestJS 的复杂路由

import type { VercelRequest, VercelResponse } from '@vercel/node';

// 模拟数据
const mockProducts = [
  { id: '1', name: '海贼王一番赏', type: 'ichiban', price: 58, image: 'https://picsum.photos/200/200?random=1', description: '经典海贼王角色手办' },
  { id: '2', name: '鬼灭之刃扭蛋', type: 'gashapon', price: 35, image: 'https://picsum.photos/200/200?random=2', description: 'Q版角色扭蛋系列' },
  { id: '3', name: '龙珠爬塔挑战', type: 'tower', price: 88, image: 'https://picsum.photos/200/200?random=3', description: '爬塔赢取超级赛亚人' },
];

const mockCategories = [
  { id: '1', name: '一番赏', icon: 'fire' },
  { id: '2', name: '扭蛋', icon: 'gift' },
  { id: '3', name: '爬塔', icon: 'trophy' },
];

// 路由处理器
const handlers: Record<string, Function> = {
  // 健康检查
  'GET /health': () => ({
    success: true,
    message: '盲盒后端服务运行正常',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  }),
  
  // 商品列表
  'GET /api/products': () => ({
    code: 200,
    message: '获取成功',
    data: {
      list: mockProducts,
      total: mockProducts.length,
    },
  }),
  
  // 商品详情
  'GET /api/products/:id': (req: VercelRequest) => {
    const id = req.query.id as string;
    const product = mockProducts.find(p => p.id === id);
    if (!product) {
      return { code: 404, message: '商品不存在' };
    }
    return { code: 200, message: '获取成功', data: product };
  },
  
  // 推荐商品
  'GET /api/products/recommended': () => ({
    code: 200,
    message: '获取成功',
    data: mockProducts.slice(0, 3),
  }),
  
  // 新品
  'GET /api/products/new': () => ({
    code: 200,
    message: '获取成功',
    data: mockProducts.slice(0, 2),
  }),
  
  // 分类列表
  'GET /api/categories': () => ({
    code: 200,
    message: '获取成功',
    data: mockCategories,
  }),
  
  // 盲盒列表 (兼容旧接口)
  'GET /api/boxes': () => ({
    code: 200,
    message: '获取成功',
    data: mockProducts.map(p => ({
      ...p,
      cover: p.image,
      totalTickets: 100,
      soldTickets: 45,
    })),
  }),
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const path = req.url?.split('?')[0] || '';
  
  // 构建路由键
  let routeKey = `${req.method} ${path}`;
  
  // 尝试精确匹配
  let handler = handlers[routeKey];
  
  // 如果没有精确匹配，尝试模式匹配
  if (!handler) {
    // 处理 /api/products/:id 类型的路由
    if (path.startsWith('/api/products/') && path !== '/api/products/recommended' && path !== '/api/products/new') {
      const id = path.replace('/api/products/', '');
      req.query.id = id;
      handler = handlers['GET /api/products/:id'];
    }
  }
  
  // 如果没有找到处理器，返回健康检查
  if (!handler) {
    handler = handlers['GET /health'];
  }
  
  try {
    const result = await handler(req);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
