import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// 动态导入避免构建时问题
let app: any;
let AppModule: any;

async function bootstrap() {
  if (!app) {
    // 动态导入 AppModule
    const module = await import('../apps/api/src/app.module');
    AppModule = module.AppModule;
    
    const nestApp = await NestFactory.create(AppModule);
    
    // 全局验证管道
    nestApp.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }));
    
    // 启用CORS
    nestApp.enableCors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    });
    
    // 全局前缀
    nestApp.setGlobalPrefix('api');
    
    await nestApp.init();
    app = nestApp;
  }
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 健康检查端点
  if (req.url === '/health' || req.url === '/api/health') {
    return res.status(200).json({
      success: true,
      message: '盲盒后端服务运行正常',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production'
    });
  }
  
  try {
    const nestApp = await bootstrap();
    const server = nestApp.getHttpAdapter().getInstance();
    return server(req, res);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
