import { USER_SEED } from '@lib/shared/seeds';
import { DevService, startApp } from '@lib/test-utils';
import { INestApplication } from '@nestjs/common';
import { UsersAppModule } from '@app/users/users-app.module';
import * as request from 'supertest';

describe('Authentication', () => {
  let app: INestApplication;
  let token: string;

  beforeEach(async () => {
    ({ app } = await startApp(UsersAppModule));
    ({ token } = await app
      .get(DevService)
      .login({ email: USER_SEED.activeUser.email }));
  });

  it('guards against unauthenticated access', () => {
    return request(app.getHttpServer()).get('/users/self').expect(403);
  });

  it('guards against unauthorized access', () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});
