import { Router } from 'express';
import { AuthController } from '../controllers/authController';

const router = Router();

router.get('/health', (req, res) => {
	res.json({ status: 'Auth Microservice is running' });
});
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/confirmar/:token', AuthController.confirmar);
router.post('/eventos', AuthController.evento);

export default router;
