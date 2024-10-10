import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsModule } from '../transactions/transactions.module';
import {
  SCAN_OVERDUE_USERS_QUEUE_NAME,
  ScanOverdueUsersWorker,
} from './scan-overdue-users.worker';
import { User } from './user.model';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: SCAN_OVERDUE_USERS_QUEUE_NAME }),
    TypeOrmModule.forFeature([User]),
    TransactionsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, ScanOverdueUsersWorker],
  exports: [UsersService],
})
export class UsersModule {}
