import { Router } from 'express';
import {
  getStandard,
  getEvents,
  getToolContract
} from '../controllers/catalogController.js';

const router = Router();

// Contrato publico (sin API key): descubrimiento del Event Catalog.
router.get('/event-standard', getStandard);
router.get('/events', getEvents);
router.get('/tools/:toolId', getToolContract);

export default router;
