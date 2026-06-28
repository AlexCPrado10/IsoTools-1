// src/tools/collect_quality_measurements.js
// Captura de mediciones del producto durante producción. isoEvent: "quality_measurement_data".
export const meta = {
  id: 'collect_quality_measurements',
  name: 'Captura de Mediciones de Calidad',
  version: '1.0.0',
  category: 'quality',
  consumes: ['PRODUCT_SPEC_UPDATED'],
  produces: ['MEASUREMENTS_CAPTURED']
};

export function handler (event) {
  const input = event.data || {};
  return {
    event: { type: 'MEASUREMENTS_CAPTURED', category: 'quality', severity: 'low' },
    asset: event.asset,
    data: {
      partId: input.partId || 'PART-001',
      characteristicId: input.characteristicId || 'CHAR-DIAM-01',
      measurements: [10.01, 9.98, 10.03, 9.99, 10.02, 10.0, 9.97, 10.04],
      passFailResult: 'pass',
      defectsFound: 0
    }
  };
}
