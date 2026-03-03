import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: async (config: ConfigService): Promise<RedisClientType> => {
        const client = createClient({
          url: config.get('REDIS_URL', 'redis://localhost:6379'),
        });
        await client.connect();
        console.log('✅ Redis连接成功');
        return client as RedisClientType;
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
