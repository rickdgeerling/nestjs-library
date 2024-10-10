import { startApp } from '@lib/test-utils';
import { INestApplication } from '@nestjs/common';
import { BooksAppModule } from '@app/books/books-app.module';
import * as request from 'supertest';

describe('Get books (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeEach(async () => {
    ({ app, token } = await startApp(BooksAppModule));
  });

  afterEach(() => app.close());

  it('gets all books in library', () => {
    return request(app.getHttpServer())
      .get('/books')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toEqual(4);
      });
  });
});
