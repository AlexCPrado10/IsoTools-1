// src/tools/<tu_tool_id>.js
//
// Plantilla de tool completa. Pasos para usarla:
//   1. Renombra el archivo a tu <tool_id> (snake_case).
//   2. Cambia meta.id para que coincida con el nombre del archivo.
//   3. Ajusta consumes / produces a los event.type que aplican.
//   4. Implementa la lógica dentro de handler().
//   5. Devuelve { event, asset, data } — o un array de eventos — o null.
//
// NO devuelvas event_id, timestamp, module, platform_version,
// correlation_id ni causation_id. El bus los rellena automáticamente.

export const meta = {
  id:          'detect_production_deviation',
  name:        'Detect Production Deviation',
  version:     '1.0.0',
  consumes:    ['PRODUCTION_METRICS_SNAPSHOT'],
  produces:    ['PRODUCTION_DEVIATION_DETECTED'],
  category:    'productivity',
  description: 'Compara producción planificada vs real y emite alerta si la desviación supera 5%.',
};

export async function handler(inputEvent) {
  const { planned, actual } = inputEvent.data;
  const deviationPct = ((actual - planned) / planned) * 100;

  if (Math.abs(deviationPct) < 5) {
    return null;
  }

  return {
    event: {
      type:     'PRODUCTION_DEVIATION_DETECTED',
      category: 'productivity',
      severity: Math.abs(deviationPct) > 15 ? 'high' : 'medium',
    },
    asset: inputEvent.asset,
    data: {
      planned,
      actual,
      deviation_pct: Number(deviationPct.toFixed(2)),
    },
  };
}
