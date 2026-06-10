import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { DrizzleInstrumentation } from "@kubiks/otel-drizzle";
import { logger } from "./lib/logger";

const otelSDK = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "https://ingest.kubiks.app/v1/traces",
    headers: {
      "x-kubiks-key": process.env.OTEL_EXPORTER_OTLP_HEADERS?.split("=")[1] || "",
    },
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-express": {
        enabled: true,
      },
      "@opentelemetry/instrumentation-http": {
        enabled: true,
      },
    }),
    new DrizzleInstrumentation(),
  ],
  serviceName: process.env.OTEL_SERVICE_NAME || "api-server",
});

otelSDK
  .start()
  .then(() => {
    logger.info("OpenTelemetry started successfully");
  })
  .catch((err) => {
    logger.error({ err }, "Failed to start OpenTelemetry");
  });

process.on("SIGTERM", () => {
  otelSDK
    .shutdown()
    .then(() => logger.info("OpenTelemetry shutdown successfully"))
    .catch((err) => logger.error({ err }, "Failed to shutdown OpenTelemetry"));
});
