import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import { logs, metrics, NodeSDK } from '@opentelemetry/sdk-node';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { BullMQInstrumentation } from './bullmq-instrumentation';

const serviceName = process.env.SERVICE_NAME ?? 'nest-app';
const resource = Resource.default().merge(
  new Resource({
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_VERSION]: process.env.npm_package_version,
  }),
);

if (process.env.OTEL_DEBUG === 'true') {
  diag.setLogger(new DiagConsoleLogger(), { logLevel: DiagLogLevel.DEBUG });
}

const sdk = new NodeSDK({
  resource,
  traceExporter: new OTLPTraceExporter(),
  metricReader: new metrics.PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter(),
  }),
  logRecordProcessors: [
    new logs.SimpleLogRecordProcessor(new OTLPLogExporter()),
  ],
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-nestjs-core': { enabled: false },
      '@opentelemetry/instrumentation-express': { enabled: true },
      '@opentelemetry/instrumentation-ioredis': { enabled: true },
      '@opentelemetry/instrumentation-mysql': { enabled: true },
      '@opentelemetry/instrumentation-redis': { enabled: true },
      '@opentelemetry/instrumentation-http': { enabled: true },
      '@opentelemetry/instrumentation-pino': { enabled: true },
      '@opentelemetry/instrumentation-fs': { enabled: false },
      '@opentelemetry/instrumentation-pg': { enabled: true },
    }),
    new BullMQInstrumentation(),
  ],
  serviceName,
});

sdk.start();
