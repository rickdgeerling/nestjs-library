/* eslint-disable @typescript-eslint/no-this-alias */
import { Counter, Gauge, ValueType } from '@opentelemetry/api';
import {
  InstrumentationBase,
  InstrumentationConfig,
  InstrumentationModuleDefinition,
  InstrumentationNodeModuleDefinition,
} from '@opentelemetry/instrumentation';
import type bullmq from 'bullmq';

/**
 * Class that monkeypatches OpenTelemetry instrumentation into Bull queues
 */
export class BullMQInstrumentation extends InstrumentationBase<any> {
  private jobCounter: Counter;

  constructor(config: InstrumentationConfig = {}) {
    super('bullmq-instrumentation', '0.53.0', config);
  }

  protected init(): void | InstrumentationModuleDefinition[] {
    return [
      new InstrumentationNodeModuleDefinition(
        // Package to monkeypatch
        'bullmq',
        // Supported Versions
        ['*'],
        // Patching module
        (moduleExports: typeof bullmq) => {
          this.setupMetrics();
          this.wrapQueue(moduleExports);
          return moduleExports;
        },
        // Unpatching module
        (moduleExports: typeof bullmq) => {
          this._unwrap(moduleExports.Queue.prototype, 'add');
          return moduleExports;
        },
        [],
      ),
    ];
  }

  private setupMetrics() {
    this.jobCounter = this.meter.createCounter('bullmq_added', {
      description: 'Jobs added to queue',
      valueType: ValueType.INT,
      unit: 'jobs',
    });
  }

  private wrapQueue(moduleExports: typeof bullmq) {
    const self = this;

    this._wrap(
      moduleExports.Queue.prototype,
      'add',
      (original: bullmq.Queue['add']) => {
        return function addOtel(
          this: bullmq.Queue,
          ...args: Parameters<bullmq.Queue['add']>
        ) {
          self.jobCounter.add(1, {
            queue_name: this.name,
            job_name: args[0],
          });

          return original.apply(this, args);
        };
      },
    );
  }
}
