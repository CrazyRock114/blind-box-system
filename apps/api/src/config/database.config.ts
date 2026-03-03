/** @format */

export const DatabaseConfig = () => ({
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'password',
    name: process.env.DB_NAME || 'blindbox_db',
    synchronize: process.env.DB_SYNC || 'true',
    logging: process.env.DB_LOGGING || 'false',
  },
});
