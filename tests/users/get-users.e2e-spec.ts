import { startApp } from '@lib/test-utils';
import { INestApplication } from '@nestjs/common';
import { UsersAppModule } from '@app/users/users-app.module';
import * as request from 'supertest';

describe('Get users (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeEach(async () => {
    ({ app, token } = await startApp(UsersAppModule));
  });

  afterEach(() => app.close());

  it('returns all users', () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toEqual(5);
      });
  });
});
