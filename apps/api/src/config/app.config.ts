/** @format */

export const AppConfig = () => ({
  app: {
    name: process.env.APP_NAME || 'BlindBox System',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
    version: process.env.APP_VERSION || '1.0.0',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB, 10) || 0,
  },
  wechat: {
    appId: process.env.WECHAT_APP_ID || '',
    appSecret: process.env.WECHAT_APP_SECRET || '',
    mchId: process.env.WECHAT_MCH_ID || '',
    mchKey: process.env.WECHAT_MCH_KEY || '',
    notifyUrl: process.env.WECHAT_NOTIFY_URL || '',
  },
  oss: {
    type: process.env.OSS_TYPE || 'local',
    endpoint: process.env.OSS_ENDPOINT || '',
    accessKey: process.env.OSS_ACCESS_KEY || '',
    secretKey: process.env.OSS_SECRET_KEY || '',
    bucket: process.env.OSS_BUCKET || '',
    region: process.env.OSS_REGION || '',
  },
});
