import { Global, Module } from '@nestjs/common';
import { UsersClient } from './users-client';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NATS_OPTIONS } from '@lib/shared';
import { DevClient } from './dev-client';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NATS_CLIENT',
        transport: Transport.NATS,
        options: NATS_OPTIONS,
      },
    ]),
  ],
  providers: [UsersClient, DevClient],
  exports: [UsersClient, DevClient],
})
export class MessengerClientsModule {}
