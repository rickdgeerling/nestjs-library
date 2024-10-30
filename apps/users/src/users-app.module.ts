import { AuthModule } from '@lib/auth';
import { MessengerClientsModule } from '@lib/messenger-clients';
import { getTypeOrmConfig } from '@lib/shared';
import { OtelModule } from '@lib/otel';
import { LoggingModule } from '@lib/shared';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevModule } from './dev/dev.module';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';
import { BullModule } from '@nestjs/bullmq';
import { ValidationModule } from '@lib/shared/validation.module';

@Module({
  imports: [
    OtelModule,
    LoggingModule,
    ValidationModule,
    TypeOrmModule.forRoot(getTypeOrmConfig('users')),
    AuthModule.registerAsync({
      imports: [UsersModule],
      useFactory: (usersService: UsersService) => ({
        getUserBySub: (id) => usersService.getUser(id),
      }),
      inject: [UsersService],
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    UsersModule,
    DevModule,
    MessengerClientsModule,
  ],
})
export class UsersAppModule {}
