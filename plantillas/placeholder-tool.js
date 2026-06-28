// src/tools/<tu_tool_id>.js — PLACEHOLDER
//
// Esto es un placeholder. Lo subes a main para que otros programadores
// puedan encadenar sus tools al tuyo mientras desarrollas la lógica real.
//
// Reglas obligatorias de un placeholder:
//   - meta.version empieza con "0.x.x-placeholder"
//   - meta.description empieza con "[PLACEHOLDER]"
//   - data._placeholder: true en cada salida
//   - Los valores son plausibles (no null, no 0, no "TODO")
//
// Cuando subas a 1.0.0:
//   - Quitas el "_placeholder" del data
//   - Quitas el "[PLACEHOLDER]" de la description
//   - Cambias version a "1.0.0"
//   - Nada más cambia — el contrato se mantiene.

export const meta = {
  id:       'forecast_production_delays',
  name:     'Forecast Production Delays',
  version:  '0.1.0-placeholder',
  consumes: ['PRODUCTION_METRICS_SNAPSHOT'],
  produces: ['PRODUCTION_DELAY_FORECASTED'],
  category: 'productivity',
  description: '[PLACEHOLDER] Pronostica retrasos de producción.',
};

export async function handler(inputEvent) {
  return {
    event: {
      type:     'PRODUCTION_DELAY_FORECASTED',
      category: 'productivity',
      severity: 'medium',
    },
    asset: inputEvent.asset,
    data: {
      forecast_delay_min: 45,
      confidence:         0.7,
      _placeholder:       true,
    },
  };
}
