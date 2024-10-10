import { Admin } from '@lib/auth';
import { Controller, Get } from '@nestjs/common';
import { BorrowersService } from './borrowers.service';
import { EventPattern } from '@nestjs/microservices';
import {
  UserCreatedPayload,
  UserEvents,
  UserUpdatedPayload,
} from '@lib/messenger-clients/user.types';

@Controller('borrowers')
export class BorrowersController {
  constructor(private readonly borrowersService: BorrowersService) {}

  @Admin()
  @Get()
  getUsers() {
    return this.borrowersService.getBorrowers();
  }

  @EventPattern(UserEvents.created)
  onUserCreated(event: UserCreatedPayload) {
    this.borrowersService.createBorrower(event);
  }

  @EventPattern(UserEvents.updated)
  onUserUpdated(event: UserUpdatedPayload) {
    this.borrowersService.updateBorrower(event);
  }
}
