import crypto from 'crypto';
import pool from '../db/index.js';

export function apiKeyAuth (requiredScopes = []) {
  return async function apiKeyMiddleware (req, res, next) {
    try {
      const apiKey = req.header('x-api-key');
      if (!apiKey) {
        return res.status(401).json({ error: 'API key required' });
      }

      const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

      const { rows } = await pool.query(
        'SELECT id, scopes, active FROM api_keys WHERE key_hash = $1 LIMIT 1',
        [keyHash]
      );

      const keyRow = rows[0];

      if (!keyRow || keyRow.active === false) {
        return res.status(401).json({ error: 'Invalid API key' });
      }

      const hasScopes = requiredScopes.every((scope) => keyRow.scopes.includes(scope));

      if (!hasScopes) {
        return res.status(403).json({ error: 'Insufficient scope' });
      }

      await pool.query('UPDATE api_keys SET last_used_at = NOW() WHERE id = $1', [keyRow.id]);

      req.apiKey = {
        id: keyRow.id,
        scopes: keyRow.scopes
      };

      return next();
    } catch (error) {
      return next(error);
    }
  };
}
