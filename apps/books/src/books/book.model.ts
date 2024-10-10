import { Borrowing } from '../borrowing/borrowing.model';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  title: string;

  @Column()
  author: string;

  @Column()
  isbn: string;

  @Column({ type: 'int' })
  amount: number;

  @OneToMany(() => Borrowing, (borrowing) => borrowing.book)
  borrowings?: Borrowing[];
}
