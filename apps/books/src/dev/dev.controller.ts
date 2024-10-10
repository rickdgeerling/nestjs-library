import { Public } from '@lib/auth';
import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { DevEvents } from '@lib/messenger-clients';
import { DevService } from '@lib/test-utils';

@Public()
@Controller('dev')
export class DevController {
  constructor(private readonly devService: DevService) {}

  @EventPattern(DevEvents.seed)
  onSeed() {
    this.devService.seed();
  }

  @EventPattern(DevEvents.truncate)
  onTruncate() {
    this.devService.truncate();
  }
}
