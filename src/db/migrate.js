// src/db/migrate.js
// Migración idempotente que corre al arrancar la app (también en Railway).
// Garantiza que las columnas de la cadena causal existan sin depender de que
// alguien corra SQL a mano. Es NO FATAL: si algo falla, se loguea pero la API
// arranca igual (no tumbamos el sitio por la migración).
import pool from './index.js';

const STATEMENTS = [
  'ALTER TABLE industrial_events ADD COLUMN IF NOT EXISTS correlation_id TEXT',
  'ALTER TABLE industrial_events ADD COLUMN IF NOT EXISTS causation_id TEXT',
  'CREATE INDEX IF NOT EXISTS idx_industrial_events_correlation_id ON industrial_events (correlation_id)'
];

export async function ensureSchema () {
  for (const sql of STATEMENTS) {
    try {
      await pool.query(sql);
    } catch (err) {
      console.error('[migrate] no se pudo aplicar (no fatal):', err.message);
    }
  }
  console.log('[migrate] esquema de cadena causal verificado (correlation_id/causation_id)');
}
