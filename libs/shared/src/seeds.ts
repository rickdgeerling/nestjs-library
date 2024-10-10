import { UserResult } from '@lib/messenger-clients';
import { UserRole } from './user-role';
import { UserStatus } from './user-status';

export const USER_SEED: Record<string, UserResult> = {
  admin: {
    email: 'admin@library.local',
    id: 'bf312f71-8f9b-4e9e-ac3a-bd0cc25a8488',
    role: UserRole.admin,
    status: UserStatus.active,
    credit: 0,
  },
  activeUser: {
    email: 'john.doe@gmail.com',
    id: '7124e629-9121-43ed-84ca-49b617a95b69',
    role: UserRole.user,
    status: UserStatus.active,
    credit: 1000,
  },
  indebtedUser: {
    email: 'bob@gmail.com',
    id: 'e0c16058-10cd-4d8a-955c-20290736c8d8',
    role: UserRole.user,
    status: UserStatus.active,
    credit: -10,
  },
  suspendedUser: {
    email: 'jane.doe@gmail.com',
    id: '9dcb92ca-5107-4972-b599-8893bf085ddc',
    role: UserRole.user,
    status: UserStatus.suspended,
    credit: -1780,
  },
  overdueUser: {
    email: 'jane.austin@gmail.com',
    id: '4165ce4a-db74-4d9e-9501-b9dda94e9e2d',
    role: UserRole.user,
    status: UserStatus.active,
    credit: 500,
  },
} as const;
