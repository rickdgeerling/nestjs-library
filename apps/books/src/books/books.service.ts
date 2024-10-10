import { BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BorrowingStatus } from '../borrowing/borrowing-status';
import { Book } from './book.model';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly booksRepo: Repository<Book>,
  ) {}

  getBooks(relations = false) {
    return this.booksRepo.find({
      relations: {
        borrowings: relations,
      },
    });
  }

  getBook(id: number, relations = false) {
    return this.booksRepo.findOneOrFail({
      where: { id },
      relations: { borrowings: relations },
    });
  }

  async isBookAvailable(id: number) {
    const book = await this.getBook(id, true);
    const available =
      book.amount -
      book.borrowings.filter(({ status }) =>
        [BorrowingStatus.active, BorrowingStatus.overdue].includes(status),
      ).length;
    return available > 0;
  }

  createBook(book: CreateBookDto) {
    return this.booksRepo.save(book);
  }

  async updateBook({ id, ...update }: UpdateBookDto) {
    const book = await this.booksRepo.findOneOrFail({ where: { id } });
    Object.assign(book, update);
    return this.booksRepo.save(book);
  }

  async deleteBook(id: number) {
    const book = await this.getBook(id, true);
    const openBorrowings = book.borrowings.filter(({ status }) =>
      [BorrowingStatus.active, BorrowingStatus.overdue].includes(status),
    );
    if (openBorrowings.length > 0) {
      throw new BadRequestException('Book is lent out');
    }
    book.amount = 0;
    return this.booksRepo.save(book);
  }

  async writeOffBook(id: number) {
    const book = await this.getBook(id);
    book.amount -= 1;
    return this.updateBook(book);
  }
}
