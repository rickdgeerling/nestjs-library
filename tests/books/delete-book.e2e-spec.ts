import { startApp } from '@lib/test-utils';
import { INestApplication } from '@nestjs/common';
import { BooksAppModule } from '@app/books/books-app.module';
import * as request from 'supertest';

describe('Delete book (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeEach(async () => {
    ({ app, token } = await startApp(BooksAppModule));
  });

  afterEach(() => app.close());

  it('sets amount to zero', () => {
    return request(app.getHttpServer())
      .delete('/books/3')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.objectContaining({
            amount: 0,
          }),
        );
      });
  });

  it('throws an error if the book is lent out', async () => {
    const response = await request(app.getHttpServer())
      .delete('/books/1')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch('lent out');
  });
});
