import { v4 as uuidv4 } from 'uuid';
import pool from '../db/index.js';
import capabilities from '../db/capabilities.js';
import config from '../config.js';
import { getConsumes } from './catalogService.js';
import { latestCache } from './cache.js';

// Columnas de insercion (19). `seq` NO se lista: es identity y la asigna Postgres.
const INSERT_SQL = `
  INSERT INTO industrial_events (
    id, event_id, timestamp, platform_version,
    module_id, module_version,
    asset_id, asset_type, plant_id, area_id, line_id, location,
    event_type, category, severity,
    data, metadata, correlation_id, causation_id
  ) VALUES (
    $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19
  )`;

function toValues (event) {
  const correlationId = event.correlation_id || event.event_id;
  return [
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
}

// Ingesta IDEMPOTENTE. Si el esquema tiene el indice unico de event_id, un evento
// repetido (mismo event_id, tipico de un reintento del outbox del productor) NO
// crea fila nueva: se devuelve la existente marcada `duplicate: true`. Asi los
// reintentos del productor son seguros y no ensucian el log de evidencia ISO.
export async function insertEvent (event) {
  const correlationId = event.correlation_id || event.event_id;
  const values = toValues(event);
  const returning = `event_id, received_at, correlation_id${capabilities.hasSeq ? ', seq' : ''}`;

  if (capabilities.hasEventIdUnique) {
    const { rows } = await pool.query(
      `${INSERT_SQL} ON CONFLICT (event_id) DO NOTHING RETURNING ${returning}`,
      values
    );
    if (rows[0]) {
      latestCache.clear(); // se almaceno un evento nuevo -> invalida "latest"
      return { ...rows[0], duplicate: false };
    }
    // Hubo conflicto: recuperamos la fila ya almacenada para responder igual.
    const existing = await pool.query(
      `SELECT ${returning} FROM industrial_events WHERE event_id = $1`,
      [event.event_id]
    );
    return { ...(existing.rows[0] || { event_id: event.event_id, correlation_id: correlationId }), duplicate: true };
  }

  const { rows } = await pool.query(`${INSERT_SQL} RETURNING ${returning}`, values);
  latestCache.clear(); // invalida "latest" tras cada escritura (raiz o hija del bus)
  return { ...rows[0], duplicate: false };
}

function clampLimit (limit) {
  const n = Number(limit);
  const v = Number.isFinite(n) && n > 0 ? n : config.query.defaultLimit;
  return Math.min(v, config.query.maxLimit);
}

// Cursor de avance: el `seq` mas alto del lote, para que el consumidor lo mande
// como `since_seq` en el siguiente tick (keyset, sin solaparse ni re-escanear).
function computeNextSeq (rows, sinceSeq, keyset) {
  if (!capabilities.hasSeq) return null;
  if (!rows.length) return keyset && sinceSeq != null ? Number(sinceSeq) : null;
  let max = -Infinity;
  for (const r of rows) {
    const s = Number(r.seq);
    if (Number.isFinite(s) && s > max) max = s;
  }
  return Number.isFinite(max) ? max : null;
}

// Consulta principal de eventos. Dos modos sobre el MISMO endpoint:
//   - Keyset (recomendado, continuo): pasa `sinceSeq` -> devuelve seq > cursor en
//     orden ascendente. Sin ventana de tiempo, sin dedupe del cliente.
//   - Ventana (compat): pasa `start`/`end` -> rango por timestamp, orden desc.
// Filtros server-side (evitan el over-fetch): types[], category, severity,
// moduleId, assetId. Devuelve { events, nextSeq }.
export async function fetchEvents ({
  start, end, moduleId, assetId, types, category, severity, sinceSeq, limit
} = {}) {
  const where = [];
  const values = [];
  const p = (v) => { values.push(v); return `$${values.length}`; };

  const keyset = sinceSeq != null && capabilities.hasSeq;
  if (keyset) where.push(`seq > ${p(sinceSeq)}`);
  if (start) where.push(`timestamp >= ${p(start)}`);
  if (end) where.push(`timestamp <= ${p(end)}`);
  if (moduleId) where.push(`module_id = ${p(moduleId)}`);
  if (assetId) where.push(`asset_id = ${p(assetId)}`);
  if (category) where.push(`category = ${p(category)}`);
  if (severity) where.push(`severity = ${p(severity)}`);
  if (Array.isArray(types) && types.length) where.push(`event_type = ANY(${p(types)})`);

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const orderSql = keyset
    ? 'ORDER BY seq ASC'
    : capabilities.hasSeq ? 'ORDER BY seq DESC' : 'ORDER BY timestamp DESC';
  const limitSql = `LIMIT ${p(clampLimit(limit))}`;

  const { rows } = await pool.query(
    `SELECT * FROM industrial_events ${whereSql} ${orderSql} ${limitSql}`,
    values
  );
  return { events: rows, nextSeq: computeNextSeq(rows, sinceSeq, keyset) };
}

// "La ULTIMA data publicada por la tool A." Devuelve el evento mas reciente por
// cada `event_type` que cumpla el filtro (DISTINCT ON). Un solo tipo -> un evento.
// Es el primitivo de menor over-fetch posible para el patron consumidor.
export async function fetchLatest ({ types, moduleId, assetId } = {}) {
  const where = [];
  const values = [];
  const p = (v) => { values.push(v); return `$${values.length}`; };

  if (Array.isArray(types) && types.length) where.push(`event_type = ANY(${p(types)})`);
  if (moduleId) where.push(`module_id = ${p(moduleId)}`);
  if (assetId) where.push(`asset_id = ${p(assetId)}`);

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const tiebreak = capabilities.hasSeq ? 'seq DESC' : 'timestamp DESC';
  // DISTINCT ON exige que las primeras columnas del ORDER BY sean las del DISTINCT.
  const { rows } = await pool.query(
    `SELECT DISTINCT ON (event_type) * FROM industrial_events ${whereSql}
     ORDER BY event_type, ${tiebreak}`,
    values
  );
  // Respuesta estable: mas reciente primero.
  rows.sort((a, b) => Number(b.seq || 0) - Number(a.seq || 0));
  return { events: rows, maxSeq: computeNextSeq(rows, null, false) };
}

// Entrega a un consumidor SOLO los tipos que declara consumir en tools.json. El
// consumidor nombra unicamente su propio id; nunca necesita saber quien produce.
export async function fetchForSubscriber ({ consumerToolId, sinceSeq, limit } = {}) {
  const consumes = getConsumes(consumerToolId);
  if (!consumes.length) {
    return { events: [], nextSeq: sinceSeq != null ? Number(sinceSeq) : null, consumes: [] };
  }
  const { events, nextSeq } = await fetchEvents({ types: consumes, sinceSeq, limit });
  return { events, nextSeq, consumes };
}

// Cadena causal completa de un correlation_id, en orden cronologico estable.
export async function fetchChain (correlationId) {
  const order = capabilities.hasSeq ? 'seq ASC' : 'received_at ASC';
  const query = `
    SELECT event_id, causation_id, correlation_id, module_id AS tool,
           event_type AS event, category, severity, data, received_at${capabilities.hasSeq ? ', seq' : ''}
    FROM industrial_events
    WHERE correlation_id = $1
    ORDER BY ${order}
  `;
  const { rows } = await pool.query(query, [correlationId]);
  return rows;
}
