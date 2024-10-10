import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../books/book.model';
import { Borrowing } from '../borrowing/borrowing.model';
import { Borrower } from '../borrower/borrower.model';
import { DevController } from './dev.controller';
import { BorrowerDevService } from './dev.service';
import { JwtModule } from '@nestjs/jwt';
import { JWT_SECRET } from '@lib/shared';
import { DevService } from '@lib/test-utils';
import { BorrowersModule } from '../borrower/borrowers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, Borrower, Borrowing]),
    JwtModule.register({
      secret: JWT_SECRET,
    }),
    BorrowersModule,
  ],
  controllers: [DevController],
  providers: [
    {
      provide: DevService,
      useClass: BorrowerDevService,
    },
  ],
})
export class DevModule {}
