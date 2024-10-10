import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { JWT_SECRET } from '@lib/shared';
import { AuthGuard } from './auth.guard';
import { ConfigurableModuleClass } from './auth.module-def';

@Module({
  imports: [
    JwtModule.register({
      secret: JWT_SECRET,
    }),
  ],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AuthModule extends ConfigurableModuleClass {}
