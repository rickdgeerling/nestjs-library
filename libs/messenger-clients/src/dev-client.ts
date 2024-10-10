import { Injectable } from '@nestjs/common';
import { AbstractClient } from './abstract-client';

export enum DevEvents {
  truncate = 'truncate',
  seed = 'seed',
}

@Injectable()
export class DevClient extends AbstractClient {
  async truncate() {
    return this.emit(DevEvents.truncate, {});
  }

  async seed() {
    return this.emit(DevEvents.seed, {});
  }
}
