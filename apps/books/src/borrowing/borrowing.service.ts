import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { addMonths, differenceInDays, differenceInYears } from 'date-fns';
import { In, Not, Repository } from 'typeorm';
import { BooksService } from '../books/books.service';
import { Borrower } from '../borrower/borrower.model';
import { BorrowingStatus } from './borrowing-status';
import { Borrowing } from './borrowing.model';
import { UsersClient } from '@lib/messenger-clients';
import { UserStatus } from '@lib/shared';

@Injectable()
export class BorrowingService {
  constructor(
    private readonly booksService: BooksService,
    private readonly usersClient: UsersClient,
    @InjectRepository(Borrowing)
    private readonly borrowingRepo: Repository<Borrowing>,
  ) {}

  async borrowBook(user: Borrower, bookId: number) {
    if (!(await this.booksService.isBookAvailable(bookId))) {
      throw new BadRequestException('Book is not available');
    }
    if (await this.hasOverdueBooks(user.id)) {
      throw new ForbiddenException('User has overdue books');
    }
    if (user.status === UserStatus.suspended) {
      throw new ForbiddenException('User is suspended');
    }
    const today = new Date();
    const dueDate = addMonths(today, 1);
    const days = differenceInDays(dueDate, today);
    const fees = days * 5;
    const { credit } = await this.usersClient.checkCredit({ id: user.id });
    if (credit < fees) {
      throw new BadRequestException('User has insufficient credit');
    }
    await this.usersClient.chargeFees({
      id: user.id,
      amount: fees,
      reference: `borrow book ${bookId}`,
    });
    const borrowing = this.borrowingRepo.create({
      userId: user.id,
      bookId,
      borrowingDate: today,
      dueDate,
      status: BorrowingStatus.active,
    });
    return this.borrowingRepo.save(borrowing);
  }

  async returnBook(userId: string, bookId: number) {
    const borrowing = await this.borrowingRepo.findOneOrFail({
      where: { userId, bookId },
      relations: { user: true },
    });
    if (borrowing.status === BorrowingStatus.lost) {
      throw new BadRequestException('Book is already written off');
    }
    if (borrowing.status === BorrowingStatus.returned) {
      throw new BadRequestException('Book is already returned');
    }
    const today = new Date();
    const returnDateDiff = differenceInDays(today, borrowing.dueDate);
    if (returnDateDiff < 0) {
      const refund = returnDateDiff * -5;
      await this.usersClient.addCredit({
        id: userId,
        amount: refund,
        reference: `refund for book ${borrowing.id}`,
      });
    }
    if (returnDateDiff > 0) {
      const lateFee = returnDateDiff * 10;
      await this.usersClient.chargeFees({
        id: userId,
        amount: lateFee,
        reference: `late fee for book ${borrowing.id}`,
      });
    }
    borrowing.status = BorrowingStatus.returned;
    borrowing.returnDate = today;
    await this.borrowingRepo.save(borrowing);
    return borrowing;
  }

  async scanOverdueBooks() {
    const borrowings = await this.borrowingRepo.find({
      where: {
        status: Not(In([BorrowingStatus.returned, BorrowingStatus.lost])),
      },
      relations: { user: true },
    });
    const today = new Date();
    const updatedBorrowings: Borrowing[] = [];
    const updatedUsers: Borrower[] = [];
    for (const borrowing of borrowings) {
      if (differenceInYears(today, borrowing.borrowingDate) >= 1) {
        borrowing.status = BorrowingStatus.lost;
        updatedBorrowings.push(borrowing);
        await this.usersClient.suspendUser({
          userId: borrowing.userId,
        });
        updatedUsers.push(borrowing.user);
        await this.booksService.writeOffBook(borrowing.bookId);
      } else if (today > borrowing.dueDate) {
        borrowing.status = BorrowingStatus.overdue;
        updatedBorrowings.push(borrowing);
      }
    }
    await this.borrowingRepo.save(updatedBorrowings);

    return {
      borrowings: updatedBorrowings,
      users: updatedUsers,
    };
  }

  async hasOverdueBooks(userId: string) {
    const overdue = await this.borrowingRepo.count({
      where: { status: BorrowingStatus.overdue, userId },
    });
    return overdue > 0;
  }
}
