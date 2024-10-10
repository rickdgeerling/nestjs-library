import { UserRole, UserStatus } from '@lib/shared';

export enum UserEvents {
  created = 'user.created',
  updated = 'user.updated',
}

export enum UserPatterns {
  suspendUser = 'user.suspend',
  checkCredit = 'user.check-credit',
  chargeFees = 'user.charge-fees',
  addCredit = 'user.add-credit',
  getUsers = 'user.get-many',
}

export type SuspendUserParams = {
  userId: string;
};

export type SuspendUserResult = boolean;

export type UserResult = {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  credit: number;
};

export type UserCreatedPayload = {
  id: string;
  email: string;
  role: UserRole;
};

export type UserUpdatedPayload = {
  id: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
};

export type CheckUserCreditParams = {
  id: string;
};

export type CreditResult = {
  id: string;
  credit: number;
};
export type CheckUserCreditResult = CreditResult;

export type ChargeFeesParams = {
  id: string;
  amount: number;
  reference?: string;
};

export type ChargeFeesResult = CreditResult;

export type AddCreditParams = {
  id: string;
  amount: number;
  reference?: string;
};

export type AddCreditResult = CreditResult;
