import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';

// Configurar exporter de métricas para Prometheus
const prometheusExporter = new PrometheusExporter({
  port: 9464,
  endpoint: '/metrics',
});

const sdk = new NodeSDK({
  metricReader: prometheusExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-express': {
        enabled: true,
      },
      '@opentelemetry/instrumentation-http': {
        enabled: true,
      },
      '@opentelemetry/instrumentation-pg': {
        enabled: true,
      },
    }),
  ],
});

// Iniciar o SDK
sdk.start();

console.log('OpenTelemetry inicializado com sucesso');
console.log(`Métricas Prometheus disponíveis em: http://localhost:9464/metrics`);

export { prometheusExporter, prometheusExporter as prometheusRegister };
