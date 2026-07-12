import {
  insertEvent,
  fetchEvents,
  fetchLatest,
  fetchForSubscriber,
  fetchChain
} from '../services/eventsService.js';
import { validateEventPayload } from '../services/validationService.js';
import { runChain } from '../services/eventBus.js';
import { toolExists } from '../services/catalogService.js';
import { latestCache, weakEtag } from '../services/cache.js';
import config from '../config.js';

// Corre la cadena de tools nativas con un tope de tiempo. El evento YA quedo
// guardado; si la cadena se pasa del limite, respondemos al productor sin
// bloquearlo (la cadena termina en segundo plano). Patron timeout/bulkhead.
async function runChainBounded (event, correlationId) {
  let timer;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => resolve({ timedOut: true }), config.bus.chainTimeoutMs);
  });
  try {
    const result = await Promise.race([
      runChain(event, { correlationId }).then((chain) => ({ chain })),
      timeout
    ]);
    if (result.timedOut) {
      console.warn('[bus] cadena excedio el tope; se responde y continua en segundo plano');
      return [];
    }
    return result.chain;
  } catch (busError) {
    console.error('Bus error (evento ya almacenado):', busError);
    return [];
  } finally {
    clearTimeout(timer);
  }
}

// Divide un parametro que puede venir repetido (?type=A&type=B) o como CSV
// (?type=A,B) en una lista limpia, sin vacios.
function parseList (value) {
  if (value == null) return [];
  const raw = Array.isArray(value) ? value : [value];
  const out = [];
  for (const item of raw) {
    for (const part of String(item).split(',')) {
      const t = part.trim();
      if (t) out.push(t);
    }
  }
  return out;
}

function parseSinceSeq (value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) return NaN; // marca invalido
  return n;
}

export async function ingestEvent (req, res, next) {
  try {
    const event = req.body;

    if (!event || Object.keys(event).length === 0) {
      return res.status(400).json({ error: 'Empty request body' });
    }

    const { valid, errors } = validateEventPayload(event);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid event format', details: errors });
    }

    const correlationId = event.correlation_id || event.event_id;
    event.correlation_id = correlationId;

    const storedEvent = await insertEvent(event);

    // Reintento del mismo event_id: idempotente. No re-disparamos la cadena para
    // no duplicar efectos; devolvemos 200 en vez de 201.
    if (storedEvent.duplicate) {
      return res.status(200).json({
        status: 'duplicate',
        event_id: storedEvent.event_id,
        correlation_id: storedEvent.correlation_id || correlationId,
        seq: storedEvent.seq ?? null,
        triggered: 0,
        chain: []
      });
    }

    // (La invalidacion del cache "latest" ocurre en insertEvent, el unico punto
    // de escritura — cubre tanto la raiz como los hijos que produce el bus.)
    const chain = await runChainBounded(event, correlationId);

    return res.status(201).json({
      status: 'accepted',
      event_id: storedEvent.event_id,
      received_at: storedEvent.received_at,
      correlation_id: correlationId,
      seq: storedEvent.seq ?? null,
      triggered: chain.length,
      chain
    });
  } catch (error) {
    return next(error);
  }
}

// GET /api/v1/events
// Modo keyset (recomendado): ?since_seq=N [&type=A,B][&module_id=][&asset_id=]
// Modo ventana (compat):     ?start=&end= [&type=A,B][&category=][&severity=]
export async function queryEvents (req, res, next) {
  try {
    const {
      start, end, module_id: moduleId, asset_id: assetId,
      category, severity, since_seq: sinceSeqRaw, limit
    } = req.query;

    const types = parseList(req.query.type ?? req.query.types);
    const sinceSeq = parseSinceSeq(sinceSeqRaw);
    if (Number.isNaN(sinceSeq)) {
      return res.status(400).json({ error: 'since_seq must be a non-negative integer' });
    }

    // En modo ventana (sin cursor) start/end siguen siendo obligatorios: mantiene
    // el contrato existente y evita escaneos accidentales de toda la tabla.
    if (sinceSeq == null && (!start || !end)) {
      return res.status(400).json({
        error: 'Provide either since_seq (keyset) or both start and end (time window, ISO strings)'
      });
    }

    const { events, nextSeq } = await fetchEvents({
      start, end, moduleId, assetId, types, category, severity, sinceSeq, limit
    });

    return res.json({ count: events.length, next_seq: nextSeq, events });
  } catch (error) {
    return next(error);
  }
}

// GET /api/v1/events/latest
// La ultima data por tipo. ?type=A,B [&module_id=][&asset_id=]. Cache + ETag/304.
export async function getLatestEvents (req, res, next) {
  try {
    const types = parseList(req.query.type ?? req.query.types);
    const moduleId = req.query.module_id;
    const assetId = req.query.asset_id;

    const cacheKey = JSON.stringify({ t: [...types].sort(), m: moduleId || null, a: assetId || null });

    let payload = config.cache.enabled ? latestCache.get(cacheKey) : undefined;
    if (!payload) {
      const { events, maxSeq } = await fetchLatest({ types, moduleId, assetId });
      payload = {
        count: events.length,
        max_seq: maxSeq,
        etag: weakEtag(maxSeq == null ? 'none' : maxSeq),
        events
      };
      if (config.cache.enabled) latestCache.set(cacheKey, payload);
    }

    // 304 si el cliente ya tiene esta version -> ahorra ancho de banda en el poll.
    if (req.headers['if-none-match'] && req.headers['if-none-match'] === payload.etag) {
      res.set('ETag', payload.etag);
      res.set('Cache-Control', 'private, max-age=1');
      return res.status(304).end();
    }

    res.set('ETag', payload.etag);
    res.set('Cache-Control', 'private, max-age=1');
    return res.json({ count: payload.count, max_seq: payload.max_seq, events: payload.events });
  } catch (error) {
    return next(error);
  }
}

// GET /api/v1/events/subscriptions/:consumerToolId
// Entrega solo los tipos que ESA tool declara consumir (tools.json). Keyset con
// ?since_seq=N. El consumidor no conoce a los productores.
export async function getSubscription (req, res, next) {
  try {
    const { consumerToolId } = req.params;
    if (!toolExists(consumerToolId)) {
      return res.status(404).json({ error: `Unknown tool '${consumerToolId}' (not in tools.json catalog)` });
    }

    const sinceSeq = parseSinceSeq(req.query.since_seq);
    if (Number.isNaN(sinceSeq)) {
      return res.status(400).json({ error: 'since_seq must be a non-negative integer' });
    }

    const { events, nextSeq, consumes } = await fetchForSubscriber({
      consumerToolId, sinceSeq, limit: req.query.limit
    });

    return res.json({
      consumer: consumerToolId,
      consumes,
      count: events.length,
      next_seq: nextSeq,
      events
    });
  } catch (error) {
    return next(error);
  }
}

export async function getChain (req, res, next) {
  try {
    const { correlationId } = req.params;
    const events = await fetchChain(correlationId);
    return res.json({ correlation_id: correlationId, count: events.length, events });
  } catch (error) {
    return next(error);
  }
}
