import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { OnApplicationBootstrap } from '@nestjs/common';
import { Queue } from 'bullmq';
import { BorrowingService } from './borrowing.service';

export const SCAN_OVERDUE_BOOKS_QUEUE_NAME = 'scan-overdue-books';

@Processor(SCAN_OVERDUE_BOOKS_QUEUE_NAME)
export class ScanOverdueBooksWorker
  extends WorkerHost
  implements OnApplicationBootstrap
{
  constructor(
    private readonly borrowingService: BorrowingService,
    @InjectQueue(SCAN_OVERDUE_BOOKS_QUEUE_NAME) private readonly queue: Queue,
  ) {
    super();
  }

  async process() {
    await this.borrowingService.scanOverdueBooks();
  }

  async onApplicationBootstrap() {
    await this.queue.drain(true);
    await this.queue.add('scan', {}, { repeat: { every: 60 * 1000 } });
  }
}
