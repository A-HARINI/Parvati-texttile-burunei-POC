import { Router } from 'express';
import { authenticateJwt } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';
import { createOrder, deleteOrder, listOrders, updateOrder } from '../controllers/orderController.js';

const router = Router();

const viewOrders = allowRoles('SUPER_ADMIN', 'SALES_MANAGER', 'CUSTOMER');
const createOrders = allowRoles('SUPER_ADMIN', 'SALES_MANAGER', 'CUSTOMER');
const manageOrders = allowRoles('SUPER_ADMIN', 'SALES_MANAGER');
const superOnly = allowRoles('SUPER_ADMIN');

router.get('/', authenticateJwt, viewOrders, listOrders);
router.post('/', authenticateJwt, createOrders, createOrder);
router.put('/:orderId', authenticateJwt, manageOrders, updateOrder);
router.delete('/:orderId', authenticateJwt, superOnly, deleteOrder);

export default router;
