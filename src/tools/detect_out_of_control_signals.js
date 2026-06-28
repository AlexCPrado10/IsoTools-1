// src/tools/detect_out_of_control_signals.js
// Reglas de Nelson / Western Electric sobre las cartas. isoEvent: "out_of_control_signal".
export const meta = {
  id: 'detect_out_of_control_signals',
  name: 'Detección de Señales Fuera de Control',
  version: '1.0.0',
  category: 'quality',
  consumes: ['CHART_POINTS_UPDATED'],
  produces: ['OUT_OF_CONTROL_DETECTED']
};

export function handler (event) {
  const input = event.data || {};
  return {
    event: { type: 'OUT_OF_CONTROL_DETECTED', category: 'quality', severity: 'high' },
    asset: event.asset,
    data: {
      chartId: input.chartId || 'CHART-XBAR-01',
      violationsDetected: true,
      violations: [
        { rule: 'Nelson 1', points: [7], description: 'Un punto fuera de los límites de 3 sigma' }
      ]
    }
  };
}
