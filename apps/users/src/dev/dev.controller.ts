import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '@lib/auth';
import { EventPattern } from '@nestjs/microservices';
import { DevClient, DevEvents } from '@lib/messenger-clients';
import { DevService } from '@lib/test-utils';

@Public()
@Controller('dev')
export class DevController {
  constructor(
    private readonly devService: DevService,
    private readonly devClient: DevClient,
  ) {}

  @Post('reset')
  reset() {
    this.devClient.truncate();
    return { message: 'Truncating...' };
  }

  @Post('seed')
  seed() {
    this.devClient.seed();
    return { message: 'Seeding...' };
  }

  @EventPattern(DevEvents.seed)
  onSeed() {
    this.devService.seed();
  }

  @EventPattern(DevEvents.truncate)
  onTruncate() {
    this.devService.truncate();
  }

  @Post('token')
  async login(@Body() where: { email: string }) {
    return this.devService.login(where);
  }
}
