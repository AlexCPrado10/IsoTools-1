// src/tools/manage_nonconformances.js
// Control de producto no conforme (ISO 8.7). isoEvent: "nonconformance_registered".
export const meta = {
  id: 'manage_nonconformances',
  name: 'Gestión de No Conformidades',
  version: '1.0.0',
  category: 'quality',
  consumes: ['OUT_OF_CONTROL_DETECTED', 'DEFECT_FOUND', 'FMEA_CRITICAL_FOUND'],
  produces: ['NC_REQUIRES_8D']
};

export function handler (event) {
  const input = event.data || {};
  return {
    // severity 'critical' dispara la regla 8D (severity IN ['major','critical'])
    event: { type: 'NC_REQUIRES_8D', category: 'quality', severity: 'critical' },
    asset: event.asset,
    data: {
      ncId: 'NC-2026-0007',
      status: 'open',
      assignedTo: 'calidad@planta',
      dueDate: '2026-06-20',
      estimatedCost: 1500,
      originEvent: input.chartId || input.defectType || 'fmea'
    }
  };
}
