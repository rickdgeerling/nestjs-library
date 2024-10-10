import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UsersAppModule } from '@app/users/users-app.module';
import { startApp } from '@lib/test-utils';
import { USER_SEED } from '@lib/shared/seeds';

describe('Get self (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeEach(async () => {
    ({ app, token } = await startApp(UsersAppModule));
  });

  afterEach(() => app.close());

  it('returns logged in user', () => {
    return request(app.getHttpServer())
      .get('/users/self')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toEqual(USER_SEED.admin.id);
      });
  });
});
