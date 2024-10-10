import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.model';

export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepo: Repository<Transaction>,
  ) {}

  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>) {
    return this.transactionsRepo.save(transaction);
  }
}
