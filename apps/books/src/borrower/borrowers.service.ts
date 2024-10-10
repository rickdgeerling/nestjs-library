import { UserStatus } from '@lib/shared';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Borrower } from './borrower.model';
import {
  UserCreatedPayload,
  UserUpdatedPayload,
} from '@lib/messenger-clients/user.types';
import { NotFoundException } from '@nestjs/common';

export class BorrowersService {
  constructor(
    @InjectRepository(Borrower)
    private readonly borrowersRepo: Repository<Borrower>,
  ) {}

  getBorrowers(where?: FindOptionsWhere<Borrower>) {
    return this.borrowersRepo.find({ where });
  }

  async getBorrowerBy(where: FindOptionsWhere<Borrower>) {
    const user = await this.borrowersRepo.findOneBy(where);
    if (!user) {
      throw new NotFoundException('Borrower not found');
    }
    return user;
  }

  async createBorrower(borrower: UserCreatedPayload) {
    await this.borrowersRepo.upsert(
      { status: UserStatus.active, ...borrower },
      { conflictPaths: ['id'] },
    );
  }

  async updateBorrower({ id, ...patch }: UserUpdatedPayload) {
    await this.borrowersRepo.update({ id }, patch);
  }
}
