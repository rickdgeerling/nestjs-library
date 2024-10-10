import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Borrower } from './borrower.model';
import { BorrowersController } from './borrowers.controller';
import { BorrowersService } from './borrowers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Borrower])],
  controllers: [BorrowersController],
  providers: [BorrowersService],
  exports: [BorrowersService],
})
export class BorrowersModule {}
