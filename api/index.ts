import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './apps/api/src/app.module';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let app: any;

async function bootstrap() {
  if (!app) {
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
