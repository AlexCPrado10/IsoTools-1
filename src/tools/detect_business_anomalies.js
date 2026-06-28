// src/tools/detect_business_anomalies.js
// Procesos con variabilidad inexplicada (diagnóstico y mejora). isoEvent: "business_anomaly_detected".
export const meta = {
  id: 'detect_business_anomalies',
  name: 'Detección de Anomalías de Negocio',
  version: '1.0.0',
  category: 'productivity',
  consumes: ['FORECAST_READY', 'PRODUCTION_VARIANCE_DETECTED'],
  produces: ['BUSINESS_ANOMALY_DETECTED']
};

export function handler (event) {
  const input = event.data || {};
  return {
    event: { type: 'BUSINESS_ANOMALY_DETECTED', category: 'productivity', severity: 'medium' },
    asset: event.asset,
    data: {
      anomalies: [
        { metric: 'scrap_rate', expected: 1.2, observed: 4.8, unit: '%' }
      ],
      criticalCount: 1,
      source: input.module || 'production'
    }
  };
}
