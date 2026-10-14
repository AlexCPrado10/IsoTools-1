// src/server.js
// ─────────────────────────────────────────────────────────────────────────────
// API de IsoTools — SOLO el plano de tools (ingesta de eventos + bus de tools).
// Aquí NO vive ninguna página web (ni Pug, ni dashboards, ni landings). Si buscas
// el sitio, eso quedó en el repo de la plataforma, no en IsoTools.
//
// Lo único que expone este servidor:
//   POST /api/v1/events            → valida, guarda y dispara la cadena de tools
//   GET  /api/v1/events            → consulta de eventos por rango
//   GET  /api/v1/events/chain/:id  → cadena causal de un correlation_id
//   GET  /api/v1/health            → estado del servicio
// ─────────────────────────────────────────────────────────────────────────────
import 'dotenv/config.js';
import express from 'express';
import morgan from 'morgan';
import fs from 'node:fs';
import path from 'node:path';
import { ensureSchema } from './db/migrate.js';
import eventsRouter from './routes/eventsRoutes.js';
import { checkCoreConnection, getCoreConfig } from './services/coreClient.js';

const app = express();

const PORT = process.env.PORT || 3000;
const LOG_LEVEL = process.env.LOG_LEVEL || 'dev';
const UI_DIST_DIR = process.env.UI_DIST_DIR;

app.use(express.json({ limit: '1mb' }));
app.use(morgan(LOG_LEVEL));

// API de tools
app.use('/api/v1/events', eventsRouter);
import artifactsRouter from './routes/artifactsRoutes.js';
app.use('/api/v1/artifacts', artifactsRouter);
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'isotools', tool: process.env.TOOL_ID || 'isotools', time: new Date().toISOString() });
});
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', service: 'isotools', time: new Date().toISOString() });
});
app.get('/ready', async (req, res) => {
  try {
    await checkCoreConnection();
    return res.json({ status: 'ready', service: process.env.TOOL_ID || 'isotools' });
  } catch (error) {
    return res.status(503).json({
      status: 'not_ready',
      service: process.env.TOOL_ID || 'isotools',
      error: error.message
    });
  }
});

if (UI_DIST_DIR && fs.existsSync(UI_DIST_DIR)) {
  app.use(express.static(UI_DIST_DIR));
  app.get('/', (req, res) => {
    res.sendFile(path.join(UI_DIST_DIR, 'index.html'));
  });
}

// Manejo de errores (JSON únicamente — no hay vistas que renderizar)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON format' });
  }
  console.error('Unhandled error:', err);
  return res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Los servicios publicados como tools requieren configuración del core antes
// de arrancar; el servidor central local no la necesita.
if (process.env.REQUIRE_CORE_CONNECTION === 'true') getCoreConfig();

// Verifica el esquema (columnas de cadena causal) y arranca. La migración es
// no fatal: si falla, la API arranca igual para no tumbar el servicio.
ensureSchema().finally(() => {
  app.listen(PORT, () => {
    console.log(`IsoTools · API de tools corriendo en http://localhost:${PORT}`);
  });
});

export default app;
