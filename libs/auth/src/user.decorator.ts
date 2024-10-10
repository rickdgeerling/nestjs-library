import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ReqUser = createParamDecorator(
  (prop: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    if (!req.user) {
      return null;
    }
    if (prop) {
      return req.user[prop];
    }
    return req.user;
  },
);
