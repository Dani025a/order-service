import { Router } from 'express';
import orderController from '../controllers/orderController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();
router.post('/', authenticateJWT, orderController.create);
router.get('/:id', orderController.getOrder);
export default router;
