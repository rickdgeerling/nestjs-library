import { UserRole, UserStatus } from '@lib/shared';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Transaction } from '../transactions/transaction.model';
import { UserResult } from '@lib/messenger-clients/user.types';

@Entity()
export class User {
  // Authentication will be handled by external IdP, they'll provide unique identifiers
  @PrimaryColumn({ unique: true })
  id: string;

  @Column({ enum: UserRole, default: UserRole.user, type: 'varchar' })
  role: UserRole;

  @Column({ type: 'int', nullable: false, default: 0 })
  // Store financials in smallest denominator (cents)
  credit: number;

  @Column({ unique: true })
  email: string;

  @Column({ enum: UserStatus, default: UserStatus.active, type: 'varchar' })
  status: UserStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions?: Transaction[];

  toUserResult(): UserResult {
    return {
      id: this.id,
      email: this.email,
      role: this.role,
      status: this.status,
      credit: this.credit,
    };
  }
}
