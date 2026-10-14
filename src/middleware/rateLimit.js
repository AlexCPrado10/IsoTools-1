// src/middleware/rateLimit.js
// -----------------------------------------------------------------------------
// Rate limit por API key con ventana fija en memoria. Sin dependencias ni
// infraestructura: protege el core de un poller mal configurado en bucle caliente
// o de un cliente abusivo. Debe montarse DESPUES de apiKeyAuth para poder usar el
// id de la key como cuota (cae a la IP si no hay key). Para varias instancias, la
// cuota es por-instancia; ver la nota de escalado en PLATAFORMA-CLOUD.md.
// -----------------------------------------------------------------------------
import config from "../config.js";

const buckets = new Map(); // key -> { count, reset }
let lastSweep = Date.now();

function sweep(now) {
  // Limpieza perezosa de cubetas expiradas para no crecer sin limite.
  if (now - lastSweep < 30000 && buckets.size < 10000) return;
  for (const [k, b] of buckets) {
    if (now > b.reset) buckets.delete(k);
  }
  lastSweep = now;
}

export function rateLimit() {
  return function rateLimitMiddleware(req, res, next) {
    if (!config.rateLimit.enabled) return next();

    const now = Date.now();
    sweep(now);

    const key = (req.apiKey && req.apiKey.id) || req.ip || "anonymous";
    let bucket = buckets.get(key);
    if (!bucket || now > bucket.reset) {
      bucket = { count: 0, reset: now + config.rateLimit.windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;

    const remaining = Math.max(0, config.rateLimit.max - bucket.count);
    res.set("X-RateLimit-Limit", String(config.rateLimit.max));
    res.set("X-RateLimit-Remaining", String(remaining));

    if (bucket.count > config.rateLimit.max) {
      const retryAfterSec = Math.max(1, Math.ceil((bucket.reset - now) / 1000));
      res.set("Retry-After", String(retryAfterSec));
      return res
        .status(429)
        .json({
          error: "Rate limit exceeded",
          retry_after_seconds: retryAfterSec,
        });
    }

    return next();
  };
}

export default rateLimit;
