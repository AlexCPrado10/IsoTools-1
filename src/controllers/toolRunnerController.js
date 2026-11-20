import { randomUUID } from 'node:crypto';
import { fetchCoreEventChain, publishCoreEvent } from '../services/coreClient.js';

const TOOL_IDS = new Set([
  'calculate_control_charts',
  'detect_business_anomalies',
  'generate_kpis'
]);
const METRICS = new Set([
  'scrap_rate',
  'production_efficiency',
  'energy_consumption',
  'downtime',
  'sales_revenue',
  'gross_margin',
  'inventory_turnover',
  'operating_cost'
]);
const PERIODS = new Set(['daily', 'weekly', 'monthly']);
const CHART_TYPES = new Set(['xbar-r', 'xbar-s', 'imr', 'p', 'np', 'c', 'u']);

function isNonEmptyString (value, maxLength = 80) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength;
}

function validPlantId (value) {
  return isNonEmptyString(value, 64) && /^[a-zA-Z0-9_-]+$/.test(value.trim());
}

function finiteNumber (value, min, max) {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

function validateInput (toolId, input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return 'El cuerpo debe ser un objeto JSON';
  }
  if (input.confirmSyntheticTest !== true) {
    return 'Debes confirmar que autorizas publicar un evento sintético de prueba';
  }
  if (input.plantId != null && !validPlantId(input.plantId)) {
    return 'plantId solo puede contener letras, números, guion y guion bajo (máximo 64 caracteres)';
  }
  if (input.period != null && !PERIODS.has(input.period)) {
    return 'period debe ser daily, weekly o monthly';
  }

  if (toolId === 'calculate_control_charts') {
    if (!Array.isArray(input.measurements) || input.measurements.length < 2 || input.measurements.length > 500 ||
        !input.measurements.every(value => finiteNumber(value, -1e9, 1e9))) {
      return 'measurements debe contener entre 2 y 500 valores numéricos finitos';
    }
    if (!CHART_TYPES.has(input.chartType)) return 'chartType no es un tipo de carta admitido';
    if (!Number.isInteger(input.subgroupSize) || input.subgroupSize < 2 || input.subgroupSize > 10) {
      return 'subgroupSize debe ser un entero entre 2 y 10';
    }
    if (['p', 'np', 'c', 'u'].includes(input.chartType) &&
        !input.measurements.every(value => Number.isInteger(value) && value >= 0)) {
      return 'Los conteos de defectos deben ser enteros no negativos';
    }
    if (['p', 'np'].includes(input.chartType) &&
        !input.measurements.every(value => value <= input.subgroupSize)) {
      return 'Cada conteo p/np debe ser menor o igual al tamaño de subgrupo';
    }
    if (input.characteristicId != null && !isNonEmptyString(input.characteristicId, 64)) {
      return 'characteristicId debe ser texto de hasta 64 caracteres';
    }
  }

  if (toolId === 'detect_business_anomalies') {
    if (!METRICS.has(input.metric)) return 'metric no es una métrica admitida';
    if (!finiteNumber(input.deviationPercent, -100, 1000)) {
      return 'deviationPercent debe ser un número entre -100 y 1000';
    }
    if (!['low', 'medium', 'high'].includes(input.sensitivityLevel)) {
      return 'sensitivityLevel debe ser low, medium o high';
    }
  }

  if (toolId === 'generate_kpis' && !finiteNumber(input.deviationPercent, -100, 100)) {
    return 'deviationPercent debe ser un número entre -100 y 100';
  }

  return null;
}

function isManualTestChain (events, correlationId) {
  return events.some(event =>
    event.event_id === correlationId &&
    event.tool === 'isotools_manual_test' &&
    event.data?.syntheticTest === true &&
    event.data?.testRunId === correlationId
  );
}

function isRunComplete (toolId, events) {
  if (toolId === 'generate_kpis') {
    const anomaly = events.find(event => event.event === 'BUSINESS_ANOMALY_DETECTED');
    return Boolean(anomaly && events.some(event =>
      event.tool === toolId &&
      event.event === 'KPI_REPORT_GENERATED' &&
      event.causation_id === anomaly.event_id
    ));
  }
  return events.some(event => event.tool === toolId);
}

export function createManualTestEvent (toolId, input, testRunId = randomUUID()) {
  const plantId = input.plantId?.trim() || 'ENS-PLANT-001';
  let eventType;
  let category;
  let severity;
  let data;

  if (toolId === 'calculate_control_charts') {
    eventType = 'MEASUREMENTS_CAPTURED';
    category = 'quality';
    severity = 'low';
    data = {
      characteristicId: input.characteristicId?.trim() || 'ENS-CHAR-001',
      chartType: input.chartType,
      measurements: input.measurements,
      subgroupSize: input.subgroupSize,
      ...(input.chartType === 'p' || input.chartType === 'np' || input.chartType === 'u'
        ? { subgroupCounts: input.measurements.map(() => input.subgroupSize) }
        : {})
    };
  } else if (toolId === 'detect_business_anomalies') {
    eventType = 'PRODUCTION_VARIANCE_DETECTED';
    category = 'productivity';
    severity = 'medium';
    data = {
      metric: input.metric,
      deviationPercent: input.deviationPercent,
      sensitivityLevel: input.sensitivityLevel,
      period: input.period || 'monthly',
      plantId
    };
  } else if (toolId === 'generate_kpis') {
    eventType = 'PRODUCTION_VARIANCE_DETECTED';
    category = 'productivity';
    severity = 'medium';
    data = {
      metric: 'scrap_rate',
      unit: '%',
      deviationPercent: input.deviationPercent,
      period: input.period || 'monthly',
      plantId
    };
  } else {
    throw new Error(`TOOL_ID desconocido: ${toolId}`);
  }

  return {
    event_id: testRunId,
    timestamp: new Date().toISOString(),
    platform_version: '2.0',
    module: { id: 'isotools_manual_test', version: '1.0.0' },
    asset: {
      asset_id: `ENS-ASSET-${testRunId.slice(0, 8)}`,
      asset_type: 'synthetic_test',
      plant_id: plantId
    },
    event: { type: eventType, category, severity },
    data: { ...data, syntheticTest: true, testRunId },
    metadata: {
      source: 'tool-web-ui',
      syntheticTest: true,
      testRunId,
      note: 'Evento de prueba manual; no representa una medición de producción'
    }
  };
}

export async function createRun (req, res, next) {
  try {
    const toolId = process.env.TOOL_ID;
    if (!TOOL_IDS.has(toolId)) {
      return res.status(404).json({ error: 'tool_runner_unavailable' });
    }

    const input = req.body;
    const validationError = validateInput(toolId, input);
    if (validationError) return res.status(400).json({ error: 'invalid_input', message: validationError });

    const event = createManualTestEvent(toolId, input);
    event.metadata.authorizedBy = req.session.sub;
    event.metadata.authorizationRole = req.authMode === 'open' ? 'local-dev' : 'operator';
    const accepted = await publishCoreEvent(event);
    return res.status(202).json({
      status: accepted.status,
      testRunId: event.metadata.testRunId,
      eventId: event.event_id,
      correlationId: accepted.correlation_id,
      seq: accepted.seq
    });
  } catch (error) {
    return next(error);
  }
}

export async function getRunResults (req, res, next) {
  try {
    const toolId = process.env.TOOL_ID;
    if (!TOOL_IDS.has(toolId)) {
      return res.status(404).json({ error: 'tool_runner_unavailable' });
    }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(req.params.correlationId)) {
      return res.status(400).json({ error: 'invalid_correlation_id' });
    }

    const chain = await fetchCoreEventChain(req.params.correlationId);
    const events = Array.isArray(chain.events) ? chain.events : [];
    if (!isManualTestChain(events, req.params.correlationId)) {
      return res.status(404).json({ error: 'run_not_found' });
    }
    return res.json({
      correlationId: chain.correlation_id,
      pending: !isRunComplete(toolId, events),
      events
    });
  } catch (error) {
    return next(error);
  }
}

export function requireSameOrigin (req, res, next) {
  const origin = req.get('origin');
  if (!origin) return res.status(403).json({ error: 'origin_required' });

  let parsedOrigin;
  try {
    parsedOrigin = new URL(origin);
  } catch {
    return res.status(403).json({ error: 'invalid_origin' });
  }

  const expectedOrigin = `${req.protocol}://${req.get('host')}`;
  if (parsedOrigin.origin !== expectedOrigin) {
    return res.status(403).json({ error: 'cross_origin_request_rejected' });
  }
  return next();
}

export function requireOperatorAuthorization (req, res, next) {
  if (req.authMode === 'open') return next();
  if (req.session?.roles?.includes('operator')) return next();
  return res.status(403).json({ error: 'operator_authorization_required', required: ['operator'] });
}

export const toolRunnerInternals = { isManualTestChain, isRunComplete, validateInput };
