import { BadRequestException, Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useValue: () =>
        new ValidationPipe({
          whitelist: true,
          forbidUnknownValues: true,
          forbidNonWhitelisted: true,
          exceptionFactory(errors) {
            return new BadRequestException({
              message: errors.join(),
            });
          },
        }),
    },
  ],
})
export class ValidationModule {}
