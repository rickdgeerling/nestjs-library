import { OnApplicationBootstrap } from '@nestjs/common';
import { performance } from 'perf_hooks';
import { Counter, Gauge, metrics, ValueType } from '@opentelemetry/api';

export class RuntimeMetricsService implements OnApplicationBootstrap {
  private readonly eventLoopUtilizationGauge: Gauge;
  private readonly memoryGauge: Gauge;
  private readonly cpuCounter: Counter;

  constructor() {
    const meter = metrics.getMeter('runtime-metrics');
    this.eventLoopUtilizationGauge = meter.createGauge(
      'nodejs-eventloop-utilization-percent',
      {
        description:
          'measures the ratio between idle- and active time spent in the event loop',
        valueType: ValueType.DOUBLE,
      },
    );
    this.memoryGauge = meter.createGauge('nodejs-memory-kilobytes', {
      description: 'nodejs application memory stats',
      unit: 'kilobytes',
      valueType: ValueType.INT,
    });
    this.cpuCounter = meter.createCounter('nodejs-cpu-usage', {
      description: 'nodejs cpu usage in microseconds',
      unit: 'microseconds',
      valueType: ValueType.INT,
    });
  }

  collectMetrics() {
    let previousEventLoopUtilization = performance.eventLoopUtilization();

    return () => {
      const elu = performance.eventLoopUtilization();
      this.eventLoopUtilizationGauge.record(
        performance.eventLoopUtilization(previousEventLoopUtilization, elu)
          .utilization,
      );
      previousEventLoopUtilization = elu;

      const memory = process.memoryUsage();
      const toKilobytes = (bytes: number) => Math.round(bytes / 1024);
      this.memoryGauge.record(toKilobytes(memory.rss), { type: 'rss' });
      this.memoryGauge.record(toKilobytes(memory.heapUsed), {
        type: 'heapUsed',
      });
      this.memoryGauge.record(toKilobytes(memory.heapTotal), {
        type: 'heapTotal',
      });
      this.memoryGauge.record(toKilobytes(memory.external), {
        type: 'external',
      });
      this.memoryGauge.record(toKilobytes(memory.arrayBuffers), {
        type: 'arrayBuffers',
      });

      const cpu = process.cpuUsage();
      this.cpuCounter.add(cpu.user, { type: 'user' });
      this.cpuCounter.add(cpu.system, { type: 'system' });
    };
  }

  onApplicationBootstrap() {
    setInterval(this.collectMetrics(), 2500);
  }
}
