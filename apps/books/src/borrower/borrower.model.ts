import { UserRole, UserStatus } from '@lib/shared';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Borrowing } from '../borrowing/borrowing.model';

@Entity()
export class Borrower {
  @PrimaryColumn({ unique: true })
  id: string;

  @Column()
  email: string;

  @Column({ enum: UserRole, default: UserRole.user, type: 'varchar' })
  role: UserRole;

  @Column({ enum: UserStatus, default: UserStatus.active, type: 'varchar' })
  status: UserStatus;

  @OneToMany(() => Borrowing, (borrowing) => borrowing.user)
  borrowings?: Borrowing[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
