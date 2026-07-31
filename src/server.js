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
import { ensureSchema } from './db/migrate.js';
import eventsRouter from './routes/eventsRoutes.js';

const app = express();

const PORT = process.env.PORT || 3000;
const LOG_LEVEL = process.env.LOG_LEVEL || 'dev';

app.use(express.json({ limit: '1mb' }));
app.use(morgan(LOG_LEVEL));

// API de tools
app.use('/api/v1/events', eventsRouter);
import artifactsRouter from './routes/artifactsRoutes.js';
app.use('/api/v1/artifacts', artifactsRouter);
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', service: 'isotools', time: new Date().toISOString() });
});

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

// Verifica el esquema (columnas de cadena causal) y arranca. La migración es
// no fatal: si falla, la API arranca igual para no tumbar el servicio.
ensureSchema().finally(() => {
  app.listen(PORT, () => {
    console.log(`IsoTools · API de tools corriendo en http://localhost:${PORT}`);
  });
});

export default app;
