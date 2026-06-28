import { Router } from 'express';
import {
  ingestEvent,
  queryEvents,
  getChain
} from '../controllers/eventsController.js';
import { apiKeyAuth } from '../middleware/apiKeyAuth.js';

const router = Router();

router.post('/', apiKeyAuth(['events:write']), ingestEvent);
router.get('/', apiKeyAuth(['events:read']), queryEvents);
router.get('/chain/:correlationId', apiKeyAuth(['events:read']), getChain);

export default router;
