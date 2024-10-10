import { NATS_OPTIONS } from '@lib/shared';
import { USER_SEED } from '@lib/shared/seeds';
import { DynamicModule, Type, ValidationPipe } from '@nestjs/common';
import { ClientProxy, NatsOptions, Transport } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';

export abstract class DevService {
  abstract truncate(): Promise<void>;
  abstract seed(): Promise<void>;
  abstract login(credentials: { email: string }): Promise<{ token: string }>;
}

export async function startApp(moduleDef: Type<any> | DynamicModule) {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [moduleDef],
  }).compile();

  const app = moduleFixture.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.connectMicroservice<NatsOptions>(
    {
      transport: Transport.NATS,
      options: {
        ...NATS_OPTIONS,
        queue: 'books',
      },
    },
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();
  // const port = randomInt(3000, 9000);
  await app.init();
  await app.get<ClientProxy>('NATS_CLIENT').connect();
  const devService: DevService = app.get(DevService);
  await devService.truncate();
  await devService.seed();
  const { token } = await devService.login({ email: USER_SEED.admin.email });
  return { app, token, devService };
}
