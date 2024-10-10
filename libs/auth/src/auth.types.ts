import { UserRole, UserStatus } from '@lib/shared';

export type AuthUserFetcher<User extends AuthUser> = (
  externalId: string,
) => Promise<User>;

export interface AuthModuleConfig<User extends AuthUser> {
  getUserBySub: AuthUserFetcher<User>;
}

export type AuthUser = {
  role: UserRole;
  status: UserStatus;
};
