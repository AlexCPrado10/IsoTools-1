// scripts/test_<tu_tool_id>.js
//
// Smoke test del handler — aislado, sin bus.
// Corre: node scripts/test_<tu_tool_id>.js
//
// Adapta:
//   1. El import de la línea de abajo a tu tool.
//   2. inputEvent.event.type debe coincidir con uno de los consumes de tu tool.
//   3. inputEvent.data debe tener los campos que tu handler espera.

import { handler } from '../src/tools/detect_production_deviation.js';

const inputEvent = {
  event_id:  '01HG7Z9KQR5N3M2P4VX8YBWQTC',
  timestamp: '2026-05-19T14:32:10.123Z',
  module: {
    id:      'production_metrics_collector',
    version: '1.0.0',
  },
  asset: {
    asset_id:   'plant_01-assembly-line_2-robot_03',
    asset_type: 'robot',
    plant_id:   'plant_01',
    area_id:    'assembly',
    line_id:    'line_2',
  },
  event: {
    type:     'PRODUCTION_METRICS_SNAPSHOT',
    category: 'productivity',
    severity: 'low',
  },
  data: {
    planned: 100,
    actual:  82,
  },
};

const result = await handler(inputEvent);
console.log(JSON.stringify(result, null, 2));
