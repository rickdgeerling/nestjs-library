import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { NatsContext } from '@nestjs/microservices';
import {
  Context,
  trace,
  propagation,
  ROOT_CONTEXT,
  Span,
  SpanKind,
  SpanStatusCode,
} from '@opentelemetry/api';
import {
  MESSAGINGOPERATIONVALUES_RECEIVE,
  SEMATTRS_CODE_FUNCTION,
  SEMATTRS_CODE_NAMESPACE,
  SEMATTRS_ENDUSER_ID,
  SEMATTRS_MESSAGING_DESTINATION,
  SEMATTRS_MESSAGING_OPERATION,
  SEMATTRS_MESSAGING_PROTOCOL,
  SEMATTRS_MESSAGING_SYSTEM,
} from '@opentelemetry/semantic-conventions';
import { Response } from 'express';
import { finalize, Observable, tap } from 'rxjs';

/**
 * OpenTelemetry interceptor for NestJS applications.
 *
 * This interceptor uses the OpenTelemetry API to trace incoming requests and report errors. When
 * it's a NATS request, it'll try to propagate the trace context from the incoming request headers.
 *
 * CAVEAT: Interceptors run after guards, so it might miss requests that are rejected by a guard.
 *         Build an instrumentation at the library-level to ensure all requests are traced.
 */
@Injectable()
export class OpenTelemetryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const type = context.getType();
    let user: { id: string } | undefined;

    let parentContext: Context | undefined;
    let spanKind = SpanKind.SERVER;
    const extraAttributes: Record<string, string> = {};

    if (type === 'http') {
      user = context.switchToHttp().getRequest().user;
      extraAttributes[SEMATTRS_ENDUSER_ID] = user?.id;
    } else if (type === 'rpc') {
      const headers = this.getHeaders(context.switchToRpc().getContext());
      parentContext = propagation.extract(ROOT_CONTEXT, headers);

      spanKind = SpanKind.CONSUMER;
      Object.assign(extraAttributes, {
        [SEMATTRS_MESSAGING_SYSTEM]: 'nats',
        [SEMATTRS_MESSAGING_PROTOCOL]: 'nats',
        [SEMATTRS_MESSAGING_DESTINATION]: context
          .switchToRpc()
          .getContext<NatsContext>()
          .getSubject(),
        [SEMATTRS_MESSAGING_OPERATION]: MESSAGINGOPERATIONVALUES_RECEIVE,
      });
    }

    const routeName = `${context.getClass().name}.${context.getHandler().name}`;
    return trace.getTracer('nest-app').startActiveSpan(
      routeName,
      {
        kind: spanKind,
        attributes: {
          [SEMATTRS_CODE_NAMESPACE]: context.getClass().name,
          [SEMATTRS_CODE_FUNCTION]: context.getHandler().name,
          ...extraAttributes,
        },
      },
      parentContext,
      (span) => {
        return next.handle().pipe(
          tap({
            next: () => {
              span.setStatus({ code: SpanStatusCode.OK });
            },
            error: (error: unknown) => {
              span.setStatus({ code: SpanStatusCode.ERROR });
              this.reportError(span, error);
            },
          }),
          finalize(() => {
            if (type === 'http') {
              context
                .switchToHttp()
                .getResponse<Response>()
                .setHeader('x-trace-id', span.spanContext().traceId);
            }
            span.end();
          }),
        );
      },
    );
  }

  private reportError(span: Span, exception: any) {
    if ('message' in exception) {
      span.recordException(exception);
    } else {
      span.recordException(new InternalServerErrorException(exception));
    }
  }

  private getHeaders(natsMessage: NatsContext): Record<string, string> {
    const headers = natsMessage.getHeaders();
    if (!headers) {
      return {};
    }

    return headers.keys().reduce(
      (acc, key) => ({
        ...acc,
        [key]: headers.get(key),
      }),
      {},
    );
  }
}
