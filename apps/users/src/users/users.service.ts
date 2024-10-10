import { UserRole, UserStatus } from '@lib/shared';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, LessThan, Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.model';
import { UsersClient } from '@lib/messenger-clients';
import { TransactionsService } from '../transactions/transactions.service';
import { subYears } from 'date-fns';
import { NotFoundException } from '@nestjs/common';

export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly usersClient: UsersClient,
    private readonly transactionsService: TransactionsService,
  ) {}

  getUsers(where?: FindOptionsWhere<User>) {
    return this.usersRepo.find({ where });
  }

  async getUserBy(filters: FindOptionsWhere<User>) {
    const user = await this.usersRepo.findOneBy(filters);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getUser(id: string) {
    const user = await this.usersRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async createUser(params: {
    email: string;
    id: string;
    role?: UserRole;
    status?: UserStatus;
  }) {
    const user = await this.usersRepo.save({
      status: UserStatus.active,
      role: UserRole.user,
      ...params,
    });
    await this.usersClient.userCreated(user);
    return user;
  }

  async updateUser({ id, ...update }: UpdateUserDto) {
    const user = await this.usersRepo.findOneByOrFail({ id });
    Object.assign(user, update);
    await this.usersRepo.save(user);
    await this.usersClient.userUpdated({
      id,
      ...update,
    });
    return user;
  }

  async suspendUser(id: string) {
    return await this.updateUser({ id, status: UserStatus.suspended });
  }

  async checkCredit(externalId: string) {
    const { credit, id } = await this.getUser(externalId);
    return { credit, id };
  }

  async addCredit(id: string, amount: number, reference = 'add credit') {
    const user = await this.usersRepo.findOneByOrFail({ id });
    await this.transactionsService.createTransaction({
      userId: user.id,
      amount,
      reference,
    });
    user.credit += amount;
    await this.usersRepo.save(user);
    return { id, credit: user.credit };
  }

  async chargeFees(id: string, amount: number, reference = 'charge fees') {
    const user = await this.usersRepo.findOneByOrFail({ id });
    await this.transactionsService.createTransaction({
      userId: user.id,
      amount,
      reference,
    });
    user.credit -= amount;
    await this.usersRepo.save(user);
    return { id, credit: user.credit };
  }

  async scanOverdueUsers() {
    const updatedUsers: User[] = [];
    const users = await this.getUsers({
      status: UserStatus.active,
      updatedAt: LessThan(subYears(new Date(), 1)),
    });
    for (const user of users) {
      if (user.credit < 0) {
        await this.suspendUser(user.id);
        updatedUsers.push(user);
      }
    }
    return updatedUsers;
  }
}
