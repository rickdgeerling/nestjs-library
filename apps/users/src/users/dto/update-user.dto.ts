import { UserRole, UserStatus } from '@lib/shared';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsPositive()
  id: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
