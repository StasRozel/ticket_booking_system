import { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
export function getTypeOrmConfig(
  configService: ConfigService,
): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: configService.getOrThrow('HOST'),
    port: configService.getOrThrow<number>('DB_PORT'),
    username: configService.getOrThrow('DB_USERNAME'),
    password: configService.getOrThrow('DB_PASSWRD'),
    database: configService.getOrThrow('DB_NAME'),
    autoLoadEntities: true,
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    synchronize: true,
  };
}
