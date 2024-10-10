import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { OnApplicationBootstrap } from '@nestjs/common';
import { Queue } from 'bullmq';
import { UsersService } from './users.service';

export const SCAN_OVERDUE_USERS_QUEUE_NAME = 'scan-overdue-users';

@Processor(SCAN_OVERDUE_USERS_QUEUE_NAME)
export class ScanOverdueUsersWorker
  extends WorkerHost
  implements OnApplicationBootstrap
{
  constructor(
    private readonly usersService: UsersService,
    @InjectQueue(SCAN_OVERDUE_USERS_QUEUE_NAME) private readonly queue: Queue,
  ) {
    super();
  }

  async process() {
    await this.usersService.scanOverdueUsers();
  }

  async onApplicationBootstrap() {
    await this.queue.drain(true);
    await this.queue.add('scan', {}, { repeat: { every: 60 * 1000 } });
  }
}
