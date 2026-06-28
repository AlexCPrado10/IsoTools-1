import { insertEvent, fetchEvents, fetchChain } from '../services/eventsService.js';
import { validateEventPayload } from '../services/validationService.js';
import { runChain } from '../services/eventBus.js';

export async function ingestEvent (req, res, next) {
  try {
    const event = req.body;

    if (!event || Object.keys(event).length === 0) {
      return res.status(400).json({ error: 'Empty request body' });
    }

    const { valid, errors } = validateEventPayload(event);

    if (!valid) {
      return res.status(400).json({
        error: 'Invalid event format',
        details: errors
      });
    }

    // El correlation_id agrupa toda la cadena: si no viene, este evento es la raíz.
    const correlationId = event.correlation_id || event.event_id;
    event.correlation_id = correlationId;

    const storedEvent = await insertEvent(event);

    // Dispara el bus: ejecuta las tools que reaccionan a este evento, en cadena.
    // Un fallo del bus NO debe tumbar la ingesta: el evento ya quedó guardado.
    let chain = [];
    try {
      chain = await runChain(event, { correlationId });
    } catch (busError) {
      console.error('Bus error (evento ya almacenado):', busError);
    }

    return res.status(201).json({
      status: 'accepted',
      event_id: storedEvent.event_id,
      received_at: storedEvent.received_at,
      correlation_id: correlationId,
      triggered: chain.length,
      chain
    });
  } catch (error) {
    return next(error);
  }
}

export async function getChain (req, res, next) {
  try {
    const { correlationId } = req.params;
    const events = await fetchChain(correlationId);
    return res.json({
      correlation_id: correlationId,
      count: events.length,
      events
    });
  } catch (error) {
    return next(error);
  }
}

export async function queryEvents (req, res, next) {
  try {
    const { start, end, module_id: moduleId, asset_id: assetId, limit = 100 } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: 'start and end query params are required (ISO strings)' });
    }

    const events = await fetchEvents({ start, end, moduleId, assetId, limit: Number(limit) });

    return res.json({
      count: events.length,
      events
    });
  } catch (error) {
    return next(error);
  }
}
