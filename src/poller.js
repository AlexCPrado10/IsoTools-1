import { createHash } from 'node:crypto';
import { fetchToolSubscription, publishCoreEvent } from './services/coreClient.js';
import { getTool } from './tools/index.js';

const DEFAULT_INTERVAL_MS = 5000;
const DEFAULT_BATCH_SIZE = 100;

function stableEventId (toolId, sourceEventId, outputIndex) {
  const bytes = createHash('sha256')
    .update(`${toolId}\0${sourceEventId}\0${outputIndex}`)
    .digest()
    .subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function normalizeInputEvent (row) {
  if (row.event?.type) return row;

  const asset = {};
  for (const [key, value] of Object.entries({
    asset_id: row.asset_id,
    asset_type: row.asset_type,
    plant_id: row.plant_id,
    area_id: row.area_id,
    line_id: row.line_id,
    location: row.location
  })) {
    if (value != null) asset[key] = value;
  }

  return {
    event_id: row.event_id,
    timestamp: row.timestamp || row.received_at,
    platform_version: row.platform_version || '1.0',
    module: {
      id: row.module_id || 'unknown',
      version: row.module_version || '1.0'
    },
    asset,
    event: {
      type: row.event_type,
      category: row.category,
      severity: row.severity
    },
    data: row.data || {},
    metadata: row.metadata || {},
    correlation_id: row.correlation_id || row.event_id,
    causation_id: row.causation_id || null,
    seq: row.seq
  };
}

function buildOutputEvent (toolId, tool, input, output, outputIndex) {
  if (!output?.event?.type) {
    throw new Error(`Tool '${toolId}' returned an event without event.type`);
  }

  return {
    event_id: stableEventId(toolId, input.event_id, outputIndex),
    timestamp: new Date().toISOString(),
    platform_version: input.platform_version || '1.0',
    module: { id: toolId, version: tool.meta.version || '1.0' },
    asset: output.asset || input.asset || {},
    event: output.event,
    data: output.data || {},
    metadata: {
      ...(output.metadata || {}),
      source_event_id: input.event_id,
      consumer_tool_id: toolId
    },
    correlation_id: input.correlation_id || input.event_id,
    causation_id: input.event_id
  };
}

export function createPoller ({
  toolId,
  intervalMs = DEFAULT_INTERVAL_MS,
  batchSize = DEFAULT_BATCH_SIZE,
  readSubscription = fetchToolSubscription,
  publish = publishCoreEvent,
  resolveTool = getTool,
  logger = console
}) {
  if (!toolId) throw new Error('TOOL_ID is required to start the tool poller');
  const tool = resolveTool(toolId);
  if (!tool) throw new Error(`No local handler is registered for TOOL_ID '${toolId}'`);

  const state = {
    toolId,
    cursor: null,
    initialized: false,
    lastPollAt: null,
    lastError: null,
    processed: 0,
    published: 0,
    running: false,
    stopped: false,
    timer: null
  };

  async function pollOnce () {
    if (state.running || state.stopped) return getStatus();
    state.running = true;
    state.lastPollAt = new Date().toISOString();

    try {
      if (!state.initialized) {
        const initial = await readSubscription(toolId, { limit: 1 });
        if (!Array.isArray(initial.events)) {
          throw new Error('Core subscription response has an invalid events array');
        }
        state.cursor = initial.next_seq == null ? 0 : Number(initial.next_seq);
        state.initialized = true;
        state.lastError = null;
        return getStatus();
      }

      const batch = await readSubscription(toolId, {
        sinceSeq: state.cursor,
        limit: batchSize
      });
      if (!Array.isArray(batch.events)) {
        throw new Error('Core subscription response has an invalid events array');
      }

      const events = batch.events
        .slice()
        .sort((a, b) => Number(a.seq || 0) - Number(b.seq || 0));

      for (const row of events) {
        const input = normalizeInputEvent(row);
        const produced = await tool.handler(input);
        const outputs = produced == null ? [] : (Array.isArray(produced) ? produced : [produced]);

        for (let i = 0; i < outputs.length; i++) {
          await publish(buildOutputEvent(toolId, tool, input, outputs[i], i));
          state.published++;
        }

        if (row.seq != null) state.cursor = Number(row.seq);
        state.processed++;
      }

      if (batch.next_seq != null) {
        state.cursor = Math.max(state.cursor ?? 0, Number(batch.next_seq));
      }
      state.lastError = null;
    } catch (error) {
      state.lastError = error.message;
      logger.error(`[poller:${toolId}] ${error.message}`);
      throw error;
    } finally {
      state.running = false;
    }

    return getStatus();
  }

  function getStatus () {
    return {
      toolId: state.toolId,
      cursor: state.cursor,
      lastPollAt: state.lastPollAt,
      lastError: state.lastError,
      processed: state.processed,
      published: state.published,
      running: state.running
    };
  }

  function start () {
    if (state.timer || state.stopped) return;
    const run = async () => {
      if (state.stopped) return;
      try {
        await pollOnce();
      } catch {
        // lastError is exposed through /status; keep the poller alive for retry.
      }
      if (!state.stopped) {
        state.timer = setTimeout(run, intervalMs);
        state.timer.unref?.();
      }
    };
    void run();
  }

  function stop () {
    state.stopped = true;
    if (state.timer) clearTimeout(state.timer);
    state.timer = null;
  }

  return { pollOnce, start, stop, getStatus };
}

let activePoller = null;

export function startPoller (options = {}) {
  if (activePoller) return activePoller;
  activePoller = createPoller({
    toolId: process.env.TOOL_ID,
    intervalMs: Number(process.env.TOOL_POLL_INTERVAL_MS) || DEFAULT_INTERVAL_MS,
    ...options
  });
  activePoller.start();
  return activePoller;
}

export function stopPoller () {
  activePoller?.stop();
  activePoller = null;
}

export function getPollerStatus () {
  return activePoller?.getStatus() || {
    toolId: process.env.TOOL_ID || null,
    enabled: false,
    cursor: null,
    lastPollAt: null,
    lastError: null
  };
}
