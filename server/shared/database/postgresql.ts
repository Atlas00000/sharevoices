import { DataSource } from 'typeorm';

export function createPostgresDataSource(options: {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  entities: any[];
  synchronize?: boolean;
  logging?: boolean;
}) {
  return new DataSource({
    type: 'postgres',
    host: options.host,
    port: options.port,
    username: options.username,
    password: options.password,
    database: options.database,
    entities: options.entities,
    synchronize: options.synchronize ?? false,
    logging: options.logging ?? false,
  });
} 