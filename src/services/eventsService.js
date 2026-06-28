import { v4 as uuidv4 } from 'uuid';
import pool from '../db/index.js';

export async function insertEvent (event) {
  const query = `
    INSERT INTO industrial_events (
      id, event_id, timestamp, platform_version,
      module_id, module_version,
      asset_id, asset_type, plant_id, area_id, line_id, location,
      event_type, category, severity,
      data, metadata, correlation_id, causation_id
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19
    )
    RETURNING event_id, received_at, correlation_id
  `;

  // Si no viene correlation_id, este evento es la raíz de una cadena nueva:
  // su correlation_id es su propio event_id.
  const correlationId = event.correlation_id || event.event_id;

  const values = [
    uuidv4(),
    event.event_id,
    event.timestamp,
    event.platform_version,
    event.module?.id,
    event.module?.version,
    event.asset?.asset_id,
    event.asset?.asset_type || null,
    event.asset?.plant_id || null,
    event.asset?.area_id || null,
    event.asset?.line_id || null,
    event.asset?.location || null,
    event.event?.type,
    event.event?.category || null,
    event.event?.severity || null,
    event.data || {},
    event.metadata || {},
    correlationId,
    event.causation_id || null
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
}

// Devuelve todos los eventos de una misma cadena causal, en orden cronológico.
export async function fetchChain (correlationId) {
  const query = `
    SELECT event_id, causation_id, correlation_id, module_id AS tool,
           event_type AS event, category, severity, data, received_at
    FROM industrial_events
    WHERE correlation_id = $1
    ORDER BY received_at ASC
  `;
  const { rows } = await pool.query(query, [correlationId]);
  return rows;
}

export async function fetchEvents ({ start, end, moduleId, assetId, limit = 100 }) {
  const values = [start, end];
  const conditions = ['timestamp BETWEEN $1 AND $2'];
  let paramIndex = values.length;

  if (moduleId) {
    paramIndex += 1;
    values.push(moduleId);
    conditions.push(`module_id = $${paramIndex}`);
  }

  if (assetId) {
    paramIndex += 1;
    values.push(assetId);
    conditions.push(`asset_id = $${paramIndex}`);
  }

  const limitValue = Math.min(limit, 1000);
  values.push(limitValue);

  const query = `
    SELECT * FROM industrial_events
    WHERE ${conditions.join(' AND ')}
    ORDER BY timestamp DESC
    LIMIT $${values.length}
  `;

  const { rows } = await pool.query(query, values);
  return rows;
}
