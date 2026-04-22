import { Router } from 'express';
import { authenticateJwt } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';
import { createAdmin, createCustomer, listUsers } from '../controllers/adminController.js';
import { listCustomers } from '../controllers/orderController.js';

const router = Router();

router.post('/create', authenticateJwt, allowRoles('SUPER_ADMIN'), createAdmin);
router.post('/customers', authenticateJwt, allowRoles('SUPER_ADMIN'), createCustomer);
router.get('/users', authenticateJwt, allowRoles('SUPER_ADMIN'), listUsers);
router.get('/customers', authenticateJwt, allowRoles('SUPER_ADMIN', 'SALES_MANAGER'), listCustomers);

export default router;
