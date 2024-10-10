import { AuthModule } from '@lib/auth';
import { MessengerClientsModule } from '@lib/messenger-clients';
import { getTypeOrmConfig, LoggingModule } from '@lib/shared';
import { ValidationModule } from '@lib/shared/validation.module';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksModule } from './books/books.module';
import { BorrowersModule } from './borrower/borrowers.module';
import { BorrowersService } from './borrower/borrowers.service';
import { BorrowingModule } from './borrowing/borrowing.module';
import { DevModule } from './dev/dev.module';

@Module({
  imports: [
    LoggingModule,
    ValidationModule,
    TypeOrmModule.forRoot(getTypeOrmConfig('books')),
    AuthModule.registerAsync({
      imports: [BorrowersModule],
      useFactory: (svc: BorrowersService) => ({
        getUserBySub: (id) => svc.getBorrowerBy({ id }),
      }),
      inject: [BorrowersService],
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    BooksModule,
    BorrowingModule,
    BorrowersModule,
    DevModule,
    MessengerClientsModule,
  ],
})
export class BooksAppModule { }
