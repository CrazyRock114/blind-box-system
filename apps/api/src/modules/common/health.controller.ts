import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'blindbox-api',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('ping')
  ping() {
    return { pong: true };
  }
}
