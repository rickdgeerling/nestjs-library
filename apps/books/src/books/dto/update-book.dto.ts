import { IsInt, IsPositive } from 'class-validator';
import { CreateBookDto } from './create-book.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateBookDto extends PartialType(CreateBookDto) {
  @IsPositive()
  @IsInt()
  id: number;
}
