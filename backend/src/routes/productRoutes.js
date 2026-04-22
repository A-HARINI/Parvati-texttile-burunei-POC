import { Router } from 'express';
import { authenticateJwt } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';
import { createProduct, deleteProduct, listProducts, updateProduct } from '../controllers/productController.js';

const router = Router();

const superOnly = allowRoles('SUPER_ADMIN');

router.get('/', listProducts);
router.post('/', authenticateJwt, superOnly, createProduct);
router.put('/:productId', authenticateJwt, superOnly, updateProduct);
router.delete('/:productId', authenticateJwt, superOnly, deleteProduct);

export default router;
