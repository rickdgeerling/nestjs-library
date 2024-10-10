import { USER_SEED } from '@lib/shared/seeds';
import { DevService, startApp } from '@lib/test-utils';
import { INestApplication } from '@nestjs/common';
import { BooksAppModule } from '@app/books/books-app.module';
import { UsersAppModule } from '@app/users/users-app.module';
import { UsersService } from '@app/users/users/users.service';
import * as request from 'supertest';

describe('Return book (e2e)', () => {
  let usersApp: INestApplication;
  let booksApp: INestApplication;
  let usersService: UsersService;
  let devService: DevService;
  let activeUserToken: string;
  let indebtedUserToken: string;
  let suspendedUserToken: string;

  beforeEach(async () => {
    ({ app: usersApp, devService } = await startApp(UsersAppModule));
    ({ app: booksApp } = await startApp(BooksAppModule));
    usersService = usersApp.get(UsersService);
    activeUserToken = (
      await devService.login({ email: USER_SEED.activeUser.email })
    ).token;
    indebtedUserToken = (
      await devService.login({ email: USER_SEED.indebtedUser.email })
    ).token;
    suspendedUserToken = (
      await devService.login({ email: USER_SEED.suspendedUser.email })
    ).token;
  });

  afterEach(async () => {
    await usersApp.close();
    await booksApp.close();
  });

  it('active user can return a book before dueDate and receive a refund', async () => {
    const userBefore = await usersService.getUser(USER_SEED.activeUser.id);
    const response = await request(booksApp.getHttpServer())
      .post('/borrow/return')
      .send({
        bookId: 1,
      })
      .set('Authorization', `Bearer ${activeUserToken}`);
    expect(response.status).toEqual(201);
    const userAfter = await usersService.getUser(USER_SEED.activeUser.id);
    expect(userBefore.credit - userAfter.credit).toEqual(-2 * 5);
  });

  it('indebted user can return an overdue book and is charged a late fee', async () => {
    const userBefore = await usersService.getUser(USER_SEED.indebtedUser.id);
    const response = await request(booksApp.getHttpServer())
      .post('/borrow/return')
      .send({
        bookId: 2,
      })
      .set('Authorization', `Bearer ${indebtedUserToken}`);
    expect(response.status).toEqual(201);
    const userAfter = await usersService.getUser(USER_SEED.indebtedUser.id);
    expect(userBefore.credit - userAfter.credit).toEqual(5 * 10);
  });

  it('a user cannot return a book after it was marked lost', async () => {
    const response = await request(booksApp.getHttpServer())
      .post('/borrow/return')
      .send({
        bookId: 1,
      })
      .set('Authorization', `Bearer ${suspendedUserToken}`);
    expect(response.status).toEqual(400);
  });
});
