import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DevService, startApp } from '@lib/test-utils';
import { UsersAppModule } from '@app/users/users-app.module';
import { BooksAppModule } from '@app/books/books-app.module';
import { UsersService } from '@app/users/users/users.service';
import { USER_SEED } from '@lib/shared/seeds';

describe('Borrow book (e2e)', () => {
  let usersApp: INestApplication;
  let booksApp: INestApplication;
  let usersService: UsersService;
  let devService: DevService;
  let activeUserToken: string;
  let indebtedUserToken: string;
  let suspendedUserToken: string;
  let overdueUserToken: string;

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
    overdueUserToken = (
      await devService.login({ email: USER_SEED.overdueUser.email })
    ).token;
  });

  afterEach(async () => {
    await booksApp.close();
    await usersApp.close();
  });

  it('active user can borrow an available book which will cost them 5ct/day', async () => {
    const userBefore = await usersService.getUser(USER_SEED.activeUser.id);
    const response = await request(booksApp.getHttpServer())
      .post('/borrow')
      .send({
        bookId: 3,
      })
      .set('Authorization', `Bearer ${activeUserToken}`);
    expect(response.status).toEqual(201);
    const userAfter = await usersService.getUser(USER_SEED.activeUser.id);
    expect(userBefore.credit - userAfter.credit).toEqual(31 * 5);
  });

  it('active user cannot borrow an unavailable book', async () => {
    const response = await request(booksApp.getHttpServer())
      .post('/borrow')
      .send({
        bookId: 2,
      })
      .set('Authorization', `Bearer ${activeUserToken}`);
    expect(response.status).toEqual(400);
    expect(response.body.message).toMatch('not available');
  });

  it('active user cannot borrow with insufficient credit', async () => {
    await usersService.chargeFees(USER_SEED.activeUser.id, 990);
    const response = await request(booksApp.getHttpServer())
      .post('/borrow')
      .send({
        bookId: 3,
      })
      .set('Authorization', `Bearer ${activeUserToken}`);
    expect(response.status).toEqual(400);
    expect(response.body.message).toMatch('insufficient credit');
  });

  it('active user cannot borrow with an overdue book', async () => {
    await usersService.chargeFees(USER_SEED.activeUser.id, 990);
    const response = await request(booksApp.getHttpServer())
      .post('/borrow')
      .send({
        bookId: 3,
      })
      .set('Authorization', `Bearer ${overdueUserToken}`);
    expect(response.status).toEqual(403);
    expect(response.body.message).toMatch('overdue books');
  });

  it('suspended user cannot borrow an available book', async () => {
    const response = await request(booksApp.getHttpServer())
      .post('/borrow')
      .send({
        bookId: 3,
      })
      .set('Authorization', `Bearer ${suspendedUserToken}`);
    expect(response.status).toEqual(403);
    expect(response.body.message).toMatch('suspended');
  });

  it('indebted user cannot borrow an available book', async () => {
    const response = await request(booksApp.getHttpServer())
      .post('/borrow')
      .send({
        bookId: 3,
      })
      .set('Authorization', `Bearer ${indebtedUserToken}`);
    expect(response.status).toEqual(403);
    expect(response.body.message).toMatch('has overdue');
  });
});
