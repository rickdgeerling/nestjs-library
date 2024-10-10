import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function getTypeOrmConfig(db: string): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: db,
    autoLoadEntities: true,
    synchronize: true,
  };
}
