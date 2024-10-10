import {
  CallHandler,
  ExecutionContext,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable } from 'rxjs';

export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const type = context.getType();
    const target = [context.getClass().name, context.getHandler().name].join(
      '.',
    );
    this.logger.log({
      msg: 'Incoming request',
      protocol: type.toUpperCase(),
      target,
    });
    return next.handle().pipe(
      catchError((error) => {
        this.logger.error({
          msg: 'Error handling request',
          protocol: type.toUpperCase(),
          target,
          error,
        });
        throw error;
      }),
    );
  }
}
