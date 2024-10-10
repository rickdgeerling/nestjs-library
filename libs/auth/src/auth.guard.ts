import { UserRole } from '@lib/shared';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_ADMIN } from './admin.decorator';
import { IS_PUBLIC } from './public.decorator';
import { AuthModuleConfig, AuthUser } from './auth.types';
import { MODULE_OPTIONS_TOKEN } from './auth.module-def';
import { AppRequest } from '@lib/shared/request.types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    @Inject(MODULE_OPTIONS_TOKEN)
    private readonly options: AuthModuleConfig<AuthUser>,
  ) {}

  async canActivate(context: ExecutionContext) {
    if (context.getType() !== 'http') {
      return true;
    }
    const request = context.switchToHttp().getRequest<AppRequest<AuthUser>>();
    const authHeader = request.headers.authorization as string;
    const isPublic =
      this.reflector.get<boolean>(IS_PUBLIC, context.getClass()) ||
      this.reflector.get<boolean>(IS_PUBLIC, context.getHandler());

    const requiresAdmin =
      this.reflector.get<boolean>(IS_ADMIN, context.getClass()) ||
      this.reflector.get<boolean>(IS_ADMIN, context.getHandler());

    if (!authHeader) {
      return isPublic;
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer') {
      return false;
    }

    const payload = await this.jwtService.verifyAsync(token);
    request.user = await this.options.getUserBySub(payload.sub);

    if (request.user) {
      if (requiresAdmin && request.user.role !== UserRole.admin) {
        return false;
      }

      return true;
    }

    return false;
  }
}
