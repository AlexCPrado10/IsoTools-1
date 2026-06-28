import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import pool from '../src/db/index.js';

const MODULES = ['vision', 'maintenance', 'quality', 'safety', 'supply'];
const ASSETS = ['robot-01', 'robot-02', 'press-01', 'line-02', 'sensor-03'];
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const EVENT_TYPES = ['ALERT', 'INFO', 'ANOMALY'];

async function main () {
  const total = parseInt(process.argv[2] || '100', 10);
  const rows = [];

  for (let i = 0; i < total; i++) {
    const timestamp = dayjs().subtract(Math.random() * 72, 'hour').toISOString();
    const moduleId = MODULES[Math.floor(Math.random() * MODULES.length)];
    const assetId = ASSETS[Math.floor(Math.random() * ASSETS.length)];
    const severity = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)];
    const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];

    rows.push([
      uuidv4(),
      `evt-${Date.now()}-${i}`,
      timestamp,
      '2.0.0',
      moduleId,
      `1.${Math.floor(Math.random() * 5)}`,
      assetId,
      'machine',
      'PLT-01',
      'AREA-A',
      'LINE-1',
      'Cell A',
      eventType,
      'CTRLHACK',
      severity,
      JSON.stringify({ metric: Math.random() * 100 }),
      JSON.stringify({ note: 'seed script' })
    ]);
  }

  for (const row of rows) {
    await pool.query(
      `INSERT INTO industrial_events (
        id, event_id, timestamp, platform_version,
        module_id, module_version,
        asset_id, asset_type, plant_id, area_id, line_id, location,
        event_type, category, severity,
        data, metadata
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
      )`,
      row
    );
  }

  console.log(`Seeded ${total} events`);
  await pool.end();
}

main().catch((err) => {
  console.error('Failed to seed events', err);
  process.exit(1);
});
