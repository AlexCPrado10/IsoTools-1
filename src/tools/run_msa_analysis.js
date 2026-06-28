// src/tools/run_msa_analysis.js
// Validación del sistema de medición - Gage R&R (ISO 7.1.5). isoEvent: "msa_analysis_result".
export const meta = {
  id: 'run_msa_analysis',
  name: 'Análisis MSA (Gage R&R)',
  version: '1.0.0',
  category: 'quality',
  consumes: ['NEW_DEVICE_REGISTERED'],
  produces: ['MSA_VALIDATED']
};

export function handler (event) {
  const input = event.data || {};
  return {
    event: { type: 'MSA_VALIDATED', category: 'quality', severity: 'low' },
    asset: event.asset,
    data: {
      gaugeId: input.gaugeId || 'GAUGE-07',
      gageRRPercent: 8.5,
      repeatability: 6.1,
      reproducibility: 5.9,
      ndc: 5,
      verdict: 'acceptable' // dispara la regla MSA→cartas (verdict == 'acceptable')
    }
  };
}
