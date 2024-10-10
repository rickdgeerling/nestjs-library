import { IsInt, IsNotEmpty, IsString, IsPositive, Max } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsString()
  @IsNotEmpty()
  isbn: string;

  @IsPositive()
  @IsInt()
  @Max(100)
  amount: number;
}
