import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { DrizzleInstrumentation } from '@kubiks/otel-drizzle';

const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'https://ingest.kubiks.app',
  headers: {
    'x-kubiks-key': process.env.OTEL_EXPORTER_OTLP_HEADERS?.split('=')[1] || '',
  },
});

const sdk = new NodeSDK({
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
    new DrizzleInstrumentation(),
  ],
  serviceName: process.env.OTEL_SERVICE_NAME || 'api-server',
});

sdk.start();

process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('SDK shut down successfully'))
    .catch((err) => console.error('Error shutting down SDK', err))
    .finally(() => process.exit(0));
});
