import '@lib/otel/init';
import { NATS_OPTIONS } from '@lib/shared';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';
import { UsersAppModule } from './users-app.module';

async function bootstrap() {
  const app = await NestFactory.create(UsersAppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  app.connectMicroservice(
    {
      transport: Transport.NATS,
      options: {
        ...NATS_OPTIONS,
        queue: 'users',
      },
    },
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
