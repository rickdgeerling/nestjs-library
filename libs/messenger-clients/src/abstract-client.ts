import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, NatsRecordBuilder } from '@nestjs/microservices';
import {
  context,
  metrics,
  propagation,
  SpanKind,
  SpanStatusCode,
  trace,
  ValueType,
} from '@opentelemetry/api';
import {
  SEMATTRS_MESSAGING_DESTINATION,
  SEMATTRS_MESSAGING_OPERATION,
  SEMATTRS_MESSAGING_PROTOCOL,
  SEMATTRS_MESSAGING_SYSTEM,
  SEMATTRS_RPC_GRPC_STATUS_CODE,
} from '@opentelemetry/semantic-conventions';
import { MsgHdrs, headers as createHeaders } from 'nats';
import { finalize, firstValueFrom, tap } from 'rxjs';

@Injectable()
export class AbstractClient {
  @Inject('NATS_CLIENT')
  private readonly natsClient: ClientProxy;

  private readonly clientCounter = metrics
    .getMeter('nats-client')
    .createCounter('nats_client_request', {
      description: 'Number of requests sent through NATS',
      valueType: ValueType.INT,
      unit: 'requests',
    });

  protected emit(event: string, data: any) {
    return firstValueFrom(this.natsClient.emit(event, data));
  }

  protected send<TResult = any, TInput = any>(
    subject: string,
    data: TInput,
  ): Promise<TResult> {
    const result$ = this.natsClient.send<TResult, TInput>(subject, data);
    return firstValueFrom(result$);
  }
}
