// src/tools/generate_kpis.js
// Dashboard de indicadores para Revisión por Dirección (ISO 9.3). isoEvent: "kpi_report_generated".
export const meta = {
  id: 'generate_kpis',
  name: 'Generación de KPIs',
  version: '1.0.0',
  category: 'system',
  consumes: ['PRODUCTION_VARIANCE_DETECTED', 'BUSINESS_ANOMALY_DETECTED'],
  produces: ['KPI_REPORT_GENERATED']
};

export function handler (event) {
  const input = event.data || {};
  return {
    event: { type: 'KPI_REPORT_GENERATED', category: 'system', severity: 'low' },
    asset: event.asset,
    data: {
      plantId: input.plantId || 'plant_01',
      period: '2026-06',
      kpis: { oee: 0.78, fpy: 0.94, scrapRate: 4.8, onTimeDelivery: 0.91 }
    }
  };
}
