import { Router } from 'express';
import { authenticateJwt } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';
import { adminSummary } from '../controllers/reportsController.js';

const router = Router();

router.get('/summary', authenticateJwt, allowRoles('SUPER_ADMIN'), adminSummary);

export default router;
