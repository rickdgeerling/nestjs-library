import { startApp } from '@lib/test-utils';
import { INestApplication } from '@nestjs/common';
import { BooksAppModule } from '@app/books/books-app.module';
import * as request from 'supertest';

describe('Create book (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeEach(async () => {
    ({ app, token } = await startApp(BooksAppModule));
  });

  afterEach(() => app.close());

  it('adds new book to library', () => {
    const book = {
      title: 'Children of Time',
      author: 'Adrian Tchaikovsky',
      isbn: '9781447273301',
      amount: 3,
    };
    return request(app.getHttpServer())
      .post('/books')
      .send(book)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual(expect.objectContaining(book));
      });
  });
});
