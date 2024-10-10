import { IsInt, IsPositive } from 'class-validator';

export class BorrowBookDto {
  @IsInt()
  @IsPositive()
  bookId: number;
}
