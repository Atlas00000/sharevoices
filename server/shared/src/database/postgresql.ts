import { DataSource } from 'typeorm';
import logger from '../logger';

let dataSource: DataSource;

export async function connectPostgreSQL(config: {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}): Promise<DataSource> {
  try {
    dataSource = new DataSource({
      type: 'postgres',
      ...config,
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV !== 'production',
      entities: ['dist/**/*.entity{.ts,.js}'],
    });

    await dataSource.initialize();
    logger.info('Connected to PostgreSQL');
    return dataSource;
  } catch (error) {
    logger.error('PostgreSQL connection error:', error);
    throw error;
  }
}

export async function disconnectPostgreSQL(): Promise<void> {
  try {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
      logger.info('Disconnected from PostgreSQL');
    }
  } catch (error) {
    logger.error('PostgreSQL disconnection error:', error);
    throw error;
  }
}

process.on('SIGINT', async () => {
  await disconnectPostgreSQL();
  process.exit(0);
}); 