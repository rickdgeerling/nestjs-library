import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule as PinoLogger } from 'nestjs-pino';
import { LoggingInterceptor } from './logging.interceptor';

@Module({
  imports: [
    PinoLogger.forRoot({
      pinoHttp: { autoLogging: false },
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class LoggingModule {}
