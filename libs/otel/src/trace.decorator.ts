import { metrics, Span, SpanStatusCode, trace } from '@opentelemetry/api';

/**
 * Run a callback after a function has completed, it handles both synchronous values, or promises
 */
export function runAfter<T>(fn: () => T, hook: (error?: Error) => void): T {
  let result: T;

  try {
    result = fn();
  } catch (error) {
    hook(error);
    throw error;
  }
  if (result instanceof Promise) {
    return result.then(
      (value) => {
        hook();
        return value;
      },
      (error) => {
        hook(error);
        throw error;
      },
    ) as T;
  }
  hook();
  return result;
}

/**
 * Wrap a method in a dedicated OpenTelemetry span for tracing
 */
export function Trace(opts?: {
  name: string;
  attributes?: Record<string, string>;
}) {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ): TypedPropertyDescriptor<any> => {
    const originalFn = descriptor.value as (...args: any[]) => any;
    const name =
      opts?.name ?? `${target.constructor.name}.${propertyKey.toString()}`;
    const tracer = trace.getTracer('trace-decorator');
    const meter = metrics.getMeter('trace-decorator');
    const metric = meter.createHistogram(opts.name);

    descriptor.value = function traceWrappedFn(this: unknown, ...args: any[]) {
      const startTime = Date.now();
      return tracer.startActiveSpan(
        name,
        { attributes: opts.attributes },
        (span: Span) => {
          return runAfter(
            () => originalFn.apply(this, args),
            (error?: Error) => {
              if (error) {
                span.setStatus({
                  code: SpanStatusCode.ERROR,
                  message: error.message,
                });
                span.recordException(error);
              }
              span.end();

              metric.record(Date.now() - startTime, {
                ...opts?.attributes,
                error: error ? 'true' : 'false',
              });
            },
          );
        },
      );
    };
    return descriptor;
  };
}
