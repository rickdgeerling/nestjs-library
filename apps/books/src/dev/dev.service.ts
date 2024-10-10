import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { addDays, subDays, subMonths } from 'date-fns';
import { DataSource, Repository } from 'typeorm';
import { Book } from '../books/book.model';
import { BorrowingStatus } from '../borrowing/borrowing-status';
import { Borrowing } from '../borrowing/borrowing.model';
import { USER_SEED } from '@lib/shared/seeds';
import { BorrowersService } from '../borrower/borrowers.service';
import { JwtService } from '@nestjs/jwt';
import { DevService } from '@lib/test-utils';

@Injectable()
export class BorrowerDevService implements DevService {
  constructor(
    private readonly borrowersService: BorrowersService,
    @InjectRepository(Book)
    private readonly bookRepo: Repository<Book>,
    @InjectRepository(Borrowing)
    private readonly borrowingRepo: Repository<Borrowing>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}

  async truncate() {
    await this.dataSource.synchronize(true);
  }

  async seed() {
    const book = this.bookRepo.create([
      {
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        isbn: '9780544003415',
        amount: 1,
      },
      {
        title: 'The Lion, the Witch and the Wardrobe',
        author: 'C.S. Lewis',
        isbn: '9780064471046',
        amount: 1,
      },
      {
        title: 'Hyperion',
        author: 'Dan Simmons',
        isbn: '9780553283686',
        amount: 1,
      },
      {
        title: 'Dune',
        author: 'Frank Herbert',
        isbn: '9780441172719',
        amount: 1,
      },
    ]);
    await this.bookRepo.save(book);

    await Promise.all(
      Object.values(USER_SEED).map((user) =>
        this.borrowersService.createBorrower(user),
      ),
    );

    const borrowing = this.borrowingRepo.create([
      {
        userId: USER_SEED.activeUser.id,
        bookId: book[0].id,
        status: BorrowingStatus.active,
        borrowingDate: subDays(new Date(), 3),
        dueDate: addDays(new Date(), 3),
      },
      {
        userId: USER_SEED.indebtedUser.id,
        bookId: book[1].id,
        status: BorrowingStatus.overdue,
        borrowingDate: subMonths(new Date(), 1),
        dueDate: subDays(new Date(), 5),
      },
      {
        userId: USER_SEED.activeUser.id,
        bookId: book[2].id,
        status: BorrowingStatus.returned,
        borrowingDate: subMonths(new Date(), 1),
        dueDate: new Date(),
      },
      {
        userId: USER_SEED.suspendedUser.id,
        bookId: book[0].id,
        status: BorrowingStatus.lost,
        borrowingDate: subMonths(new Date(), 14),
        dueDate: subMonths(new Date(), 13),
      },
      {
        userId: USER_SEED.overdueUser.id,
        bookId: book[3].id,
        status: BorrowingStatus.overdue,
        borrowingDate: subMonths(new Date(), 2),
        dueDate: subMonths(new Date(), 1),
      },
    ]);
    await this.borrowingRepo.save(borrowing);
  }

  async login(where: { email: string }) {
    const user = await this.borrowersService.getBorrowerBy(where);
    const token = await this.jwtService.signAsync({}, { subject: user.id });
    return { token };
  }
}
