import test from 'node:test';
import assert from 'node:assert/strict';
import { createPoller } from '../src/poller.js';

const tool = {
  meta: { id: 'calculate_control_charts', version: '1.0.0' },
  handler: (event) => ({
    event: { type: 'CHART_POINTS_UPDATED', category: 'quality', severity: 'low' },
    asset: event.asset,
    data: { sourceType: event.event.type }
  })
};

function eventRow (eventId, seq) {
  return {
    event_id: eventId,
    timestamp: '2026-10-13T10:00:00.000Z',
    platform_version: '1.0',
    module_id: 'historian',
    module_version: '1.0',
    asset_id: 'PRESS-01',
    asset_type: 'machine',
    plant_id: 'plant-01',
    event_type: 'MEASUREMENTS_CAPTURED',
    category: 'quality',
    severity: 'low',
    data: { measurements: [1, 2, 3] },
    metadata: {},
    correlation_id: 'corr-01',
    causation_id: 'cause-01',
    seq
  };
}

test('skips historical backlog, polls new events and preserves causal IDs', async () => {
  const requests = [];
  const published = [];
  const poller = createPoller({
    toolId: 'calculate_control_charts',
    resolveTool: () => tool,
    logger: { error () {} },
    readSubscription: async (_toolId, options) => {
      requests.push(options);
      if (requests.length === 1) {
        return { events: [eventRow('old-event', 7)], next_seq: 7 };
      }
      return { events: [eventRow('new-event', 8)], next_seq: 8 };
    },
    publish: async (event) => published.push(event)
  });

  await poller.pollOnce();
  assert.equal(poller.getStatus().cursor, 7);
  assert.equal(poller.getStatus().processed, 0);
  await poller.pollOnce();

  assert.equal(requests[1].sinceSeq, 7);
  assert.equal(published.length, 1);
  assert.equal(published[0].causation_id, 'new-event');
  assert.equal(published[0].correlation_id, 'corr-01');
  assert.equal(published[0].asset.plant_id, 'plant-01');
  assert.equal(poller.getStatus().cursor, 8);
  assert.equal(poller.getStatus().lastError, null);
});

test('does not advance cursor after publish failure and retries idempotently', async () => {
  let failFirstPublish = true;
  const publishedIds = [];
  const poller = createPoller({
    toolId: 'calculate_control_charts',
    resolveTool: () => tool,
    logger: { error () {} },
    readSubscription: async (_toolId, options) => options.sinceSeq == null
      ? { events: [], next_seq: 7 }
      : { events: [eventRow('retry-event', 8)], next_seq: 8 },
    publish: async (event) => {
      publishedIds.push(event.event_id);
      if (failFirstPublish) {
        failFirstPublish = false;
        throw new Error('core temporarily unavailable');
      }
    }
  });

  await poller.pollOnce();
  await assert.rejects(poller.pollOnce(), /core temporarily unavailable/);
  assert.equal(poller.getStatus().cursor, 7);
  assert.equal(poller.getStatus().lastError, 'core temporarily unavailable');

  await poller.pollOnce();
  assert.equal(poller.getStatus().cursor, 8);
  assert.equal(publishedIds.length, 2);
  assert.equal(publishedIds[0], publishedIds[1]);
  assert.equal(poller.getStatus().lastError, null);
});

test('rejects a tool id without a registered handler', () => {
  assert.throws(() => createPoller({
    toolId: 'missing_tool',
    resolveTool: () => null
  }), /No local handler is registered/);
});
