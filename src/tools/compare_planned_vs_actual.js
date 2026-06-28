// src/tools/compare_planned_vs_actual.js
// Objetivos vs ejecución (gap analysis y Revisión por Dirección). isoEvent: "production_variance_report".
export const meta = {
  id: 'compare_planned_vs_actual',
  name: 'Comparación Plan vs Real',
  version: '1.0.0',
  category: 'productivity',
  consumes: [],
  produces: ['PRODUCTION_VARIANCE_DETECTED']
};

export function handler (event) {
  const input = event.data || {};
  return {
    event: { type: 'PRODUCTION_VARIANCE_DETECTED', category: 'productivity', severity: 'medium' },
    asset: event.asset,
    data: {
      module: input.module || 'production',
      deviationPercent: 12.5,
      status: 'over_budget',
      details: { planned: 1000, actual: 875, unit: 'piezas' }
    }
  };
}
