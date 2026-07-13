// src/db/bootstrapApiKey.js
// Bootstrap idempotente de una API key desde variables de entorno. Pensado para
// entornos nuevos (p. ej. un proyecto/Postgres recien creado en Railway) donde
// correr scripts/createApiKey.js a mano es incomodo: defines BOOTSTRAP_API_KEY
// (y opcionalmente BOOTSTRAP_API_KEY_LABEL / BOOTSTRAP_API_KEY_SCOPES) en el
// panel, rediespliega, y la key queda insertada. Es NO FATAL y NO imprime la
// key en los logs. Recuerda QUITAR la variable despues de usarla.
import crypto from "crypto";
import pool from "./index.js";

export async function bootstrapApiKey() {
  const rawKey = process.env.BOOTSTRAP_API_KEY;
  if (!rawKey) return; // sin la variable, no hace nada.

  const label = process.env.BOOTSTRAP_API_KEY_LABEL || "bootstrap";
  const scopes = (process.env.BOOTSTRAP_API_KEY_SCOPES || "events:read,events:write")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  try {
    const res = await pool.query(
      "INSERT INTO api_keys (key_hash, label, scopes) VALUES ($1, $2, $3) ON CONFLICT (key_hash) DO NOTHING",
      [keyHash, label, scopes],
    );
    if (res.rowCount > 0) {
      console.log(`[bootstrap] API key '${label}' insertada (scopes: ${scopes.join(", ")})`);
    } else {
      console.log(`[bootstrap] API key '${label}' ya existia; sin cambios`);
    }
  } catch (err) {
    console.error("[bootstrap] no se pudo insertar la API key (no fatal):", err.message);
  }
}

export default bootstrapApiKey;
