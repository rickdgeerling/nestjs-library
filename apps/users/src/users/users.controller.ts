import { Admin, ReqUser } from '@lib/auth';
import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.model';
import { UsersService } from './users.service';
import { MessagePattern } from '@nestjs/microservices';
import {
  AddCreditParams,
  AddCreditResult,
  ChargeFeesParams,
  ChargeFeesResult,
  CheckUserCreditParams,
  CheckUserCreditResult,
  SuspendUserParams,
  SuspendUserResult,
  UserPatterns,
  UserResult,
} from '@lib/messenger-clients';
import { CreditUserDto } from './dto/credit-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('self')
  getSelf(@ReqUser() user: User) {
    return user.toUserResult();
  }

  @Admin()
  @Get()
  @MessagePattern(UserPatterns.getUsers)
  async getUsers(): Promise<UserResult[]> {
    const users = await this.usersService.getUsers();
    return users.map((user) => user.toUserResult());
  }

  @Admin()
  @Post()
  async creditUser(@Body() { id, amount }: CreditUserDto) {
    return this.usersService.addCredit(id, amount);
  }

  @Admin()
  @Put()
  updateUser(@Body() update: UpdateUserDto) {
    return this.usersService.updateUser(update);
  }

  @Admin()
  @Post('scan')
  scanOverdueUsers() {
    return this.usersService.scanOverdueUsers();
  }

  @MessagePattern(UserPatterns.suspendUser)
  async suspendUser(data: SuspendUserParams): Promise<SuspendUserResult> {
    await this.usersService.suspendUser(data.userId);
    return true;
  }

  @MessagePattern(UserPatterns.checkCredit)
  checkCredit(data: CheckUserCreditParams): Promise<CheckUserCreditResult> {
    return this.usersService.checkCredit(data.id);
  }

  @MessagePattern(UserPatterns.chargeFees)
  async chargeFees(data: ChargeFeesParams): Promise<ChargeFeesResult> {
    return this.usersService.chargeFees(data.id, data.amount, data.reference);
  }

  @MessagePattern(UserPatterns.addCredit)
  async addCredit(data: AddCreditParams): Promise<AddCreditResult> {
    return this.usersService.addCredit(data.id, data.amount, data.reference);
  }
}
