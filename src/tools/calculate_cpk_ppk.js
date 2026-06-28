// src/tools/calculate_cpk_ppk.js
// Índices de capacidad de proceso. isoEvent: "capability_index_alert".
// NOTA: solo emite CAPABILITY_BELOW_TARGET cuando el proceso NO es capaz
// (cpk < 1.33). En el mock por defecto el proceso es capaz → devuelve null
// (no emite), lo que también evita el ciclo specs→measure→cpk→specs.
export const meta = {
  id: 'calculate_cpk_ppk',
  name: 'Cálculo de Cpk / Ppk',
  version: '1.0.0',
  category: 'quality',
  consumes: ['MEASUREMENTS_CAPTURED'],
  produces: ['CAPABILITY_BELOW_TARGET']
};

export function handler (event) {
  const input = event.data || {};
  const cpk = typeof input.cpk === 'number' ? input.cpk : 1.51; // mock: capaz por defecto
  if (cpk >= 1.33) return null; // proceso capaz → nada que escalar
  return {
    event: { type: 'CAPABILITY_BELOW_TARGET', category: 'quality', severity: 'high' },
    asset: event.asset,
    data: {
      characteristicId: input.characteristicId || 'CHAR-DIAM-01',
      cp: cpk + 0.05,
      cpk,
      pp: cpk + 0.03,
      ppk: cpk,
      sigmaLevel: 3 * cpk,
      ppmDefects: 12000,
      status: 'not_capable'
    }
  };
}
