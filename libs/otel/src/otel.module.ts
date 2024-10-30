import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { OpenTelemetryInterceptor } from './otel.interceptor';
import { RuntimeMetricsService } from './runtime.metrics';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: OpenTelemetryInterceptor,
    },
    RuntimeMetricsService,
  ],
})
export class OtelModule {}
