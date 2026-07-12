// src/services/cache.js
// -----------------------------------------------------------------------------
// Cache TTL en proceso (LRU acotada). Suficiente para una instancia y para
// amortiguar el poll continuo del endpoint /latest: bajo alta frecuencia de
// lectura, la mayoria de los ticks se sirven desde memoria en vez de golpear
// Postgres. Para varias instancias, ver la nota de escalado en la doc
// (PLATAFORMA-CLOUD.md): se antepone un cache compartido o se acepta un TTL corto
// por instancia.
// -----------------------------------------------------------------------------
import config from "../config.js";

export class TtlCache {
  constructor({ ttlMs = 1500, max = 1000 } = {}) {
    this.ttl = ttlMs;
    this.max = max;
    this.map = new Map(); // key -> { val, exp }
  }

  get(key) {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.exp) {
      this.map.delete(key);
      return undefined;
    }
    // Refresca el orden LRU (Map conserva orden de insercion).
    this.map.delete(key);
    this.map.set(key, entry);
    return entry.val;
  }

  set(key, val, ttlMs = this.ttl) {
    if (this.map.size >= this.max) {
      const oldest = this.map.keys().next().value;
      if (oldest !== undefined) this.map.delete(oldest);
    }
    this.map.set(key, { val, exp: Date.now() + ttlMs });
  }

  clear() {
    this.map.clear();
  }

  get size() {
    return this.map.size;
  }
}

// Cache de las respuestas "latest". Se limpia por completo en cada ingesta nueva
// (invalidacion gruesa): los eventos ISO son de bajo volumen, asi que limpiar en
// cada escritura es correcto y simple, y el costo de "latest" queda acotado por
// la tasa de escritura, no por la de poll.
export const latestCache = new TtlCache({
  ttlMs: config.cache.latestTtlMs,
  max: config.cache.maxEntries,
});

// Devuelve un ETag debil a partir de un valor estable (p. ej. el `seq` maximo).
export function weakEtag(value) {
  return `W/"${String(value)}"`;
}

export default latestCache;
