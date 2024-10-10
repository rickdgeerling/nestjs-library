import { IsInt, IsPositive, IsString } from 'class-validator';

export class CreditUserDto {
  @IsString()
  id: string;

  @IsPositive()
  @IsInt()
  amount: number;
}
