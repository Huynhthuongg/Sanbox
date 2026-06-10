import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { DrizzleInstrumentation } from '@kubiks/otel-drizzle';

const resource = Resource.default().merge(
  new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]:
      process.env.OTEL_SERVICE_NAME || 'api-server',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  }),
);

const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'https://ingest.kubiks.app',
  headers: {
    'x-kubiks-key':
      process.env.OTEL_EXPORTER_OTLP_HEADERS?.split('=')[1] ||
      process.env.KUBIKS_API_KEY ||
      '',
  },
});

const sdk = new NodeSDK({
  resource,
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-express': {
        enabled: true,
      },
      '@opentelemetry/instrumentation-http': {
        enabled: true,
      },
    }),
    new DrizzleInstrumentation({
      responseHook: (span, response) => {
        span.setAttributes({
          'db.statement': response.statement,
        });
      },
    }),
  ],
});

sdk.start();

console.log('OpenTelemetry instrumentation initialized');

process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('OpenTelemetry SDK shut down successfully'))
    .catch((err) => console.error('OpenTelemetry SDK shutdown failed', err));
});
