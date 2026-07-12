import { Router } from 'express';
import {
  ingestEvent,
  queryEvents,
  getLatestEvents,
  getSubscription,
  getChain
} from '../controllers/eventsController.js';
import { apiKeyAuth } from '../middleware/apiKeyAuth.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

// Publicar (idempotente).
router.post('/', apiKeyAuth(['events:write']), rateLimit(), ingestEvent);

// Consumir. Rutas literales antes que las parametrizadas para evitar colisiones.
router.get('/latest', apiKeyAuth(['events:read']), rateLimit(), getLatestEvents);
router.get('/subscriptions/:consumerToolId', apiKeyAuth(['events:read']), rateLimit(), getSubscription);
router.get('/chain/:correlationId', apiKeyAuth(['events:read']), rateLimit(), getChain);
router.get('/', apiKeyAuth(['events:read']), rateLimit(), queryEvents);

export default router;
