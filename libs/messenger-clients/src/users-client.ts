import { Injectable } from '@nestjs/common';
import { AbstractClient } from './abstract-client';
import {
  AddCreditParams,
  AddCreditResult,
  ChargeFeesParams,
  ChargeFeesResult,
  CheckUserCreditParams,
  CheckUserCreditResult,
  SuspendUserParams,
  SuspendUserResult,
  UserCreatedPayload,
  UserEvents,
  UserPatterns,
  UserResult,
  UserUpdatedPayload,
} from './user.types';

@Injectable()
export class UsersClient extends AbstractClient {
  suspendUser(params: SuspendUserParams): Promise<SuspendUserResult> {
    return this.send<SuspendUserResult, SuspendUserParams>(
      UserPatterns.suspendUser,
      params,
    );
  }

  checkCredit(params: CheckUserCreditParams): Promise<CheckUserCreditResult> {
    return this.send<CheckUserCreditResult, CheckUserCreditParams>(
      UserPatterns.checkCredit,
      params,
    );
  }

  addCredit(params: AddCreditParams): Promise<AddCreditResult> {
    return this.send<AddCreditResult, AddCreditParams>(
      UserPatterns.addCredit,
      params,
    );
  }

  chargeFees(params: ChargeFeesParams): Promise<ChargeFeesResult> {
    return this.send<ChargeFeesResult, ChargeFeesParams>(
      UserPatterns.chargeFees,
      params,
    );
  }

  userCreated(user: UserCreatedPayload): Promise<void> {
    return this.emit(UserEvents.created, user);
  }

  userUpdated(user: UserUpdatedPayload): Promise<void> {
    return this.emit(UserEvents.updated, user);
  }

  getUsers(): Promise<UserResult[]> {
    return this.send<UserResult[], object>(UserPatterns.getUsers, {});
  }
}
