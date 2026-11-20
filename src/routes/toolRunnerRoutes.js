import { Router } from 'express';
import { requireSession } from '../auth/index.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { createRun, getRunResults, requireOperatorAuthorization, requireSameOrigin } from '../controllers/toolRunnerController.js';

const router = Router();

router.use(requireSession);
router.post('/runs', requireSameOrigin, requireOperatorAuthorization, rateLimit(), createRun);
router.get('/runs/:correlationId', rateLimit(), getRunResults);

export default router;
