import { startApp } from '@lib/test-utils';
import { INestApplication } from '@nestjs/common';
import { BooksAppModule } from '@app/books/books-app.module';
import * as request from 'supertest';

describe('Update book (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeEach(async () => {
    ({ app, token } = await startApp(BooksAppModule));
  });

  afterEach(() => app.close());

  it('performs partial update', () => {
    const book = {
      id: 1,
      amount: 3,
    };
    return request(app.getHttpServer())
      .put('/books')
      .send(book)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(expect.objectContaining(book));
      });
  });
});
