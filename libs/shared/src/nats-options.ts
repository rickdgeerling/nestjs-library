import { NatsOptions } from '@nestjs/microservices';

export const NATS_OPTIONS: NatsOptions['options'] = {
  servers: process.env.NATS_SERVERS?.split(';') ?? ['nats://localhost:4222'],
  reconnect: true,
  maxReconnectAttempts: -1,
  reconnectTimeWait: 1000,
  waitOnFirstConnect: true,
};
