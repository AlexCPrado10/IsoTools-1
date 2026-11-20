import test from 'node:test';
import assert from 'node:assert/strict';
import { createManualTestEvent, requireOperatorAuthorization, requireSameOrigin, toolRunnerInternals } from '../src/controllers/toolRunnerController.js';

const { isManualTestChain, isRunComplete, validateInput } = toolRunnerInternals;

test('validates control chart input and emits a marked synthetic measurement event', () => {
  const input = {
    plantId: 'ENS-PLANT-001',
    characteristicId: 'ENS-DIAM-001',
    chartType: 'xbar-r',
    subgroupSize: 2,
    measurements: [10.1, 10.2, 10.3, 10.4],
    confirmSyntheticTest: true
  };
  assert.equal(validateInput('calculate_control_charts', input), null);

  const event = createManualTestEvent('calculate_control_charts', input, '01234567-89ab-4cde-8fab-0123456789ab');
  assert.equal(event.module.id, 'isotools_manual_test');
  assert.equal(event.event.type, 'MEASUREMENTS_CAPTURED');
  assert.equal(event.data.syntheticTest, true);
  assert.equal(event.data.characteristicId, 'ENS-DIAM-001');
  assert.deepEqual(event.data.measurements, input.measurements);
  assert.match(event.asset.asset_id, /^ENS-ASSET-/);
});

test('rejects invalid measurements and unknown chart types', () => {
  const base = { chartType: 'xbar-r', subgroupSize: 2, measurements: [1, 2], confirmSyntheticTest: true };
  assert.match(validateInput('calculate_control_charts', { ...base, measurements: [1, '2'] }), /measurements/);
  assert.match(validateInput('calculate_control_charts', { ...base, chartType: 'not-a-chart' }), /chartType/);
  assert.match(validateInput('calculate_control_charts', { ...base, subgroupSize: 11 }), /subgroupSize/);
  assert.match(validateInput('calculate_control_charts', {
    ...base,
    chartType: 'np',
    subgroupSize: 5,
    measurements: [6, 1]
  }), /menor o igual/);
  assert.match(validateInput('calculate_control_charts', { ...base, confirmSyntheticTest: false }), /confirmar/);
});

test('validates anomaly and KPI inputs and marks their source events synthetic', () => {
  const anomalyInput = {
    metric: 'scrap_rate',
    deviationPercent: 35,
    sensitivityLevel: 'high',
    plantId: 'ENS-PLANT-001',
    period: 'monthly',
    confirmSyntheticTest: true
  };
  assert.equal(validateInput('detect_business_anomalies', anomalyInput), null);
  const anomalyEvent = createManualTestEvent('detect_business_anomalies', anomalyInput);
  assert.equal(anomalyEvent.event.type, 'PRODUCTION_VARIANCE_DETECTED');
  assert.equal(anomalyEvent.data.syntheticTest, true);
  assert.equal(anomalyEvent.data.metric, 'scrap_rate');

  const kpiInput = { deviationPercent: 12.5, period: 'weekly', confirmSyntheticTest: true };
  assert.equal(validateInput('generate_kpis', kpiInput), null);
  const kpiEvent = createManualTestEvent('generate_kpis', kpiInput);
  assert.equal(kpiEvent.event.type, 'PRODUCTION_VARIANCE_DETECTED');
  assert.equal(kpiEvent.data.period, 'weekly');
  assert.equal(kpiEvent.data.syntheticTest, true);
});

test('only returns a chain rooted in the matching synthetic manual test event', () => {
  const correlationId = '01234567-89ab-4cde-8fab-0123456789ab';
  const root = {
    event_id: correlationId,
    tool: 'isotools_manual_test',
    data: { syntheticTest: true, testRunId: correlationId }
  };
  assert.equal(isManualTestChain([root], correlationId), true);
  assert.equal(isManualTestChain([{ ...root, data: { ...root.data, syntheticTest: false } }], correlationId), false);
  assert.equal(isManualTestChain([{ ...root, tool: 'compare_planned_vs_actual' }], correlationId), false);
});

test('KPI run completes only after the anomaly-triggered KPI is recorded', () => {
  const anomaly = { event_id: 'anomaly-1', event: 'BUSINESS_ANOMALY_DETECTED', tool: 'detect_business_anomalies' };
  const kpi = { event_id: 'kpi-1', event: 'KPI_REPORT_GENERATED', tool: 'generate_kpis', causation_id: 'anomaly-1' };
  assert.equal(isRunComplete('generate_kpis', [anomaly]), false);
  assert.equal(isRunComplete('generate_kpis', [anomaly, kpi]), true);
  assert.equal(isRunComplete('detect_business_anomalies', [anomaly]), true);
});

test('manual event writes require the exact page origin', () => {
  const response = {
    statusCode: 200,
    body: null,
    status (code) { this.statusCode = code; return this; },
    json (body) { this.body = body; return this; }
  };
  let continued = false;
  const req = {
    protocol: 'https',
    get: name => ({ origin: 'https://ccc.orcalabs.mx', host: 'ccc.orcalabs.mx' })[name]
  };
  requireSameOrigin(req, response, () => { continued = true; });
  assert.equal(continued, true);

  continued = false;
  req.get = name => ({ origin: 'https://evil.example', host: 'ccc.orcalabs.mx' })[name];
  requireSameOrigin(req, response, () => { continued = true; });
  assert.equal(continued, false);
  assert.equal(response.statusCode, 403);
});

test('manual event writes require the operator role in SSO mode', () => {
  const response = {
    statusCode: 200,
    body: null,
    status (code) { this.statusCode = code; return this; },
    json (body) { this.body = body; return this; }
  };
  let continued = false;
  const next = () => { continued = true; };

  requireOperatorAuthorization({ authMode: 'sso', session: { roles: ['operator'] } }, response, next);
  assert.equal(continued, true);

  continued = false;
  requireOperatorAuthorization({ authMode: 'sso', session: { roles: ['platform.auditor'] } }, response, next);
  assert.equal(continued, false);
  assert.equal(response.statusCode, 403);
  assert.deepEqual(response.body, { error: 'operator_authorization_required', required: ['operator'] });

  continued = false;
  requireOperatorAuthorization({ authMode: 'open', session: { roles: [] } }, response, next);
  assert.equal(continued, true);
});
