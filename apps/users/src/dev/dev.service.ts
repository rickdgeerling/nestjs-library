import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UsersService } from '../users/users.service';
import { USER_SEED } from '@lib/shared/seeds';
import { DevService } from '@lib/test-utils';

@Injectable()
export class UsersDevService implements DevService {
  constructor(
    private readonly usersService: UsersService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}

  async truncate() {
    await this.dataSource.synchronize(true);
  }

  async seed() {
    await Promise.all(
      Object.values(USER_SEED).map((user) =>
        this.usersService.createUser(user),
      ),
    );
  }

  async login(where: { email: string }) {
    const user = await this.usersService.getUserBy(where);
    const token = await this.jwtService.signAsync({}, { subject: user.id });
    return { token };
  }
}
