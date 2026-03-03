/** @format */

import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as entities from '../entities';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'blindbox_db',
  entities: Object.values(entities),
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'migrations',
});
