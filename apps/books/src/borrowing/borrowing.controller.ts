import { Admin, ReqUser } from '@lib/auth';
import { Body, Controller, Post } from '@nestjs/common';
import { Borrower } from '../borrower/borrower.model';
import { BorrowingService } from './borrowing.service';
import { BorrowBookDto } from './dto/borrow-book.dto';
import { ReturnBookDto } from './dto/return-book.dto';

@Controller('borrow')
export class BorrowingController {
  constructor(private readonly borrowingService: BorrowingService) {}

  @Post()
  borrowBook(@Body() { bookId }: BorrowBookDto, @ReqUser() user: Borrower) {
    return this.borrowingService.borrowBook(user, bookId);
  }

  @Post('return')
  returnBook(@Body() { bookId }: ReturnBookDto, @ReqUser() user: Borrower) {
    return this.borrowingService.returnBook(user.id, bookId);
  }

  @Post('scan')
  @Admin()
  scanOutstandingBooks() {
    return this.borrowingService.scanOverdueBooks();
  }
}
