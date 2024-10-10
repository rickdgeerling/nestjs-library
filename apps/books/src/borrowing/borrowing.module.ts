import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../books/book.model';
import { BooksModule } from '../books/books.module';
import { Borrower } from '../borrower/borrower.model';
import { BorrowersModule } from '../borrower/borrowers.module';
import { BorrowingController } from './borrowing.controller';
import { Borrowing } from './borrowing.model';
import { BorrowingService } from './borrowing.service';
import {
  SCAN_OVERDUE_BOOKS_QUEUE_NAME,
  ScanOverdueBooksWorker,
} from './scan-overdue-books.worker';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({ name: SCAN_OVERDUE_BOOKS_QUEUE_NAME }),
    TypeOrmModule.forFeature([Borrowing, Borrower, Book]),
    BorrowersModule,
    BooksModule,
  ],
  controllers: [BorrowingController],
  providers: [BorrowingService, ScanOverdueBooksWorker],
})
export class BorrowingModule {}
