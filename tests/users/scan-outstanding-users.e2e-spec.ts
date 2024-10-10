import { INestApplication } from '@nestjs/common';
import { subMonths } from 'date-fns';
import * as request from 'supertest';
import { UsersAppModule } from '@app/users/users-app.module';
import { startApp } from '@lib/test-utils';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@app/users/users/user.model';
import { Repository } from 'typeorm';
import { USER_SEED } from '@lib/shared/seeds';

describe('Scan outstanding users (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeEach(async () => {
    ({ app, token } = await startApp(UsersAppModule));
    const userRepo: Repository<User> = app.get(getRepositoryToken(User));
    await userRepo.update(
      { id: USER_SEED.indebtedUser.id },
      { updatedAt: subMonths(new Date(), 13) },
    );
  });

  afterEach(() => app.close());

  it('returns users that were suspended because they were indebted for longer than 1 year', () => {
    return request(app.getHttpServer())
      .post('/users/scan')
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect((res) => {
        expect(res.body[0].id).toEqual(USER_SEED.indebtedUser.id);
      });
  });
});
