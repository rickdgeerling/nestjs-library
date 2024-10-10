import { JWT_SECRET } from '@lib/shared';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { DevController } from './dev.controller';
import { DevService } from '@lib/test-utils';
import { UsersDevService } from './dev.service';

@Module({
  imports: [
    JwtModule.register({
      secret: JWT_SECRET,
    }),
    UsersModule,
  ],
  controllers: [DevController],
  providers: [
    {
      provide: DevService,
      useClass: UsersDevService,
    },
  ],
})
export class DevModule {}
