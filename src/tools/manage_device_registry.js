// src/tools/manage_device_registry.js
// Inventario de equipos de medición y plan de calibración (ISO 7.1.5). isoEvent: "device_registry_update".
export const meta = {
  id: 'manage_device_registry',
  name: 'Registro de Dispositivos / Calibración',
  version: '1.0.0',
  category: 'configuration',
  consumes: ['HEALTH_REPORT_READY'],
  produces: ['NEW_DEVICE_REGISTERED']
};

export function handler (event) {
  const input = event.data || {};
  return {
    event: { type: 'NEW_DEVICE_REGISTERED', category: 'configuration', severity: 'low' },
    asset: event.asset,
    data: {
      operation: 'register',
      gaugeId: input.gaugeId || 'GAUGE-07',
      devices: [{ id: input.gaugeId || 'GAUGE-07', type: 'micrometer', nextCalibration: '2026-12-01' }],
      totalDevices: 24,
      operationResult: 'registered'
    }
  };
}
