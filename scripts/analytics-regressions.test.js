import test from 'node:test';
import assert from 'node:assert/strict';
import { handler as calculateControlCharts } from '../src/tools/calculate_control_charts.js';
import { handler as detectBusinessAnomalies } from '../src/tools/detect_business_anomalies.js';
import { handler as generateKpis } from '../src/tools/generate_kpis.js';

test('calculate_control_charts accepts catalog xbar_r and xbar_s values', () => {
  const event = {
    event: { type: 'MEASUREMENTS_CAPTURED' },
    data: {
      characteristicId: 'shaft-diameter',
      measurements: [10, 11, 9, 10.5, 9.5, 10, 11, 9, 10.5, 9.5],
      subgroupSize: 5
    }
  };
  const xbarR = calculateControlCharts({ ...event, data: { ...event.data, chartType: 'xbar_r' } });
  const xbarS = calculateControlCharts({ ...event, data: { ...event.data, chartType: 'xbar_s' } });

  assert.equal(xbarR.data.inControl, true);
  assert.equal(xbarS.data.inControl, true);
  assert.notEqual(xbarR.data.ucl, xbarS.data.ucl);
});

test('Xbar charts plot subgroup means and index out-of-control subgroups consistently', () => {
  const output = calculateControlCharts({
    event: { type: 'MEASUREMENTS_CAPTURED' },
    data: {
      chartType: 'xbar-r',
      subgroupSize: 5,
      measurements: [10.1, 9.9, 10.1, 9.9, 10.1, 20.1, 19.9, 20.1, 19.9, 20.1]
    }
  });

  assert.deepEqual(output.data.plotPoints, [10.02, 20.02]);
  assert.deepEqual(output.data.outOfControlPoints, [0, 1]);
});

test('np charts use defect counts and count-based control limits', () => {
  const output = calculateControlCharts({
    event: { type: 'MEASUREMENTS_CAPTURED' },
    data: { chartType: 'np', subgroupSize: 10, measurements: [0, 1, 1, 2] }
  });

  assert.deepEqual(output.data.plotPoints, [0, 1, 1, 2]);
  assert.equal(output.data.centerLine, 1);
  assert.ok(output.data.ucl > output.data.centerLine);
  assert.equal(output.data.lcl, 0);
});

test('MSA validation is consumed without emitting an empty control chart', () => {
  const output = calculateControlCharts({
    event: { type: 'MSA_VALIDATED' },
    asset: { asset_id: 'ENS-CAL-101' },
    data: { gaugeId: 'ENS-CAL-101', verdict: 'acceptable' }
  });

  assert.equal(output, null);
});

test('detect_business_anomalies accepts metric-name arrays and unknown metric names', () => {
  const output = detectBusinessAnomalies({
    event: { type: 'FORECAST_READY' },
    asset: { plant_id: 'plant-02' },
    data: { metrics: ['sales_revenue', 'unconfigured_metric'], period: 'weekly' }
  });

  assert.equal(output.data.plantId, 'plant-02');
  assert.equal(output.data.period, 'weekly');
  assert.ok(Array.isArray(output.data.anomalies));
  assert.equal(typeof output.data.criticalCount, 'number');
});

test('anomaly detection raises a critical finding for a significant production variance', () => {
  const output = detectBusinessAnomalies({
    event: { type: 'PRODUCTION_VARIANCE_DETECTED' },
    data: {
      metrics: ['sales_revenue'],
      deviationPercent: 25,
      period: 'daily'
    }
  });

  assert.equal(output.data.period, 'daily');
  assert.equal(output.data.criticalCount, 1);
  assert.equal(output.data.anomalies[0].metric, 'sales_revenue');
  assert.equal(output.data.anomalies[0].severity, 'critical');
});

test('generate_kpis keeps period inside the catalog enum', () => {
  const output = generateKpis({
    event: { type: 'BUSINESS_ANOMALY_DETECTED' },
    data: { period: '2026-06', anomalies: [] }
  });
  assert.equal(output.data.period, 'monthly');
});
