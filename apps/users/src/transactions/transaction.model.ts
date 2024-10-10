import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.model';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  amount: number;

  @Column()
  userId: string;

  @Column()
  reference: string;

  @ManyToOne(() => User, (user) => user.transactions)
  user?: User;

  @CreateDateColumn()
  createdAt: Date;
}
