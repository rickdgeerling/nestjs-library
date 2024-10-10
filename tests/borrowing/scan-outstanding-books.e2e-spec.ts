import { UsersClient } from '@lib/messenger-clients';
import { UserRole, UserStatus } from '@lib/shared';
import { DevService } from '@lib/test-utils';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BooksAppModule } from '@app/books/books-app.module';
import { Book } from '@app/books/books/book.model';
import { Borrower } from '@app/books/borrower/borrower.model';
import { BorrowingStatus } from '@app/books/borrowing/borrowing-status';
import { Borrowing } from '@app/books/borrowing/borrowing.model';
import { subMonths } from 'date-fns';
import * as request from 'supertest';
import { Repository } from 'typeorm';

describe('Scan outstanding book (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let usersClient: UsersClient;
  let borrowerRepo: Repository<Borrower>;
  let bookRepo: Repository<Book>;
  let borrowingRepo: Repository<Borrowing>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [BooksAppModule],
    })
      .overrideProvider(UsersClient)
      .useValue({ suspendUser: jest.fn().mockResolvedValue(true) })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    const devService: DevService = app.get(DevService);
    await devService.truncate();
    borrowerRepo = app.get(getRepositoryToken(Borrower));
    bookRepo = app.get(getRepositoryToken(Book));
    borrowingRepo = app.get(getRepositoryToken(Borrowing));
    usersClient = app.get(UsersClient);
    const admin = borrowerRepo.create({
      id: '0',
      email: 'admin@local.library',
      status: UserStatus.active,
      role: UserRole.admin,
    });
    await borrowerRepo.save(admin);
    await bookRepo.save({
      amount: 1,
      title: 'The Lord of the Rings',
      author: 'J. R. R. Tolkien',
      isbn: '9780007525546',
    });
    adminToken = (await devService.login({ email: admin.email })).token;
  });

  afterEach(() => app.close());

  it('suspends a user that has has an overdue book of 1 year', async () => {
    const user = borrowerRepo.create({
      id: '1',
      email: 'john.doe@gmail.com',
      status: UserStatus.active,
      updatedAt: subMonths(new Date(), 14),
      createdAt: subMonths(new Date(), 15),
      role: UserRole.user,
    });
    await borrowerRepo.save(user);
    const borrowing = borrowingRepo.create({
      bookId: 1,
      userId: user.id,
      dueDate: subMonths(new Date(), 13),
      borrowingDate: subMonths(new Date(), 14),
      status: BorrowingStatus.active,
    });
    await borrowingRepo.save(borrowing);
    const response = await request(app.getHttpServer())
      .post('/borrow/scan')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toBe(201);

    expect(usersClient.suspendUser).toHaveBeenCalledWith({ userId: user.id });
  });

  it('marks a borrowing as overdue if it is past its return date', async () => {
    const user = borrowerRepo.create({
      id: '1',
      email: 'john.doe@gmail.com',
      status: UserStatus.active,
      updatedAt: subMonths(new Date(), 2),
      createdAt: subMonths(new Date(), 8),
      role: UserRole.user,
    });
    await borrowerRepo.save(user);
    const borrowing = borrowingRepo.create({
      bookId: 1,
      userId: user.id,
      dueDate: subMonths(new Date(), 1),
      borrowingDate: subMonths(new Date(), 2),
      status: BorrowingStatus.active,
    });
    await borrowingRepo.save(borrowing);
    const response = await request(app.getHttpServer())
      .post('/borrow/scan')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toBe(201);

    await expect(
      borrowingRepo.findOneByOrFail({ id: borrowing.id }),
    ).resolves.toMatchObject({
      status: BorrowingStatus.overdue,
    });
  });

  it('marks a book as lost if it is overdue for 1 year and suspends user', async () => {
    const user = borrowerRepo.create({
      id: '1',
      email: 'john.doe@gmail.com',
      status: UserStatus.active,
      updatedAt: subMonths(new Date(), 14),
      createdAt: subMonths(new Date(), 15),
      role: UserRole.user,
    });
    await borrowerRepo.save(user);
    const borrowing = borrowingRepo.create({
      bookId: 1,
      userId: user.id,
      dueDate: subMonths(new Date(), 13),
      borrowingDate: subMonths(new Date(), 14),
      status: BorrowingStatus.active,
    });
    await borrowingRepo.save(borrowing);
    const response = await request(app.getHttpServer())
      .post('/borrow/scan')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toBe(201);

    await expect(
      borrowingRepo.findOneByOrFail({ id: borrowing.id }),
    ).resolves.toMatchObject({
      status: BorrowingStatus.lost,
    });

    await expect(bookRepo.findOneByOrFail({ id: 1 })).resolves.toMatchObject({
      amount: 0,
    });
    expect(usersClient.suspendUser).toHaveBeenCalledWith({ userId: user.id });
  });
});
