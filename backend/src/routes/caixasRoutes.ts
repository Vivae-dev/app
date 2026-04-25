import { Router } from 'express';
import { CaixasController } from '../controllers/caixasController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

router.get('/health', (req, res) => {
	res.json({ status: 'ok', mensagem: 'Microsserviço de Catálogo está rodando' });
});

router.get('/caixas', CaixasController.getAll);
router.get('/caixas/:id', CaixasController.getById);
router.post('/caixas', authenticate, requireAdmin, CaixasController.create);
router.put('/caixas/:id', authenticate, requireAdmin, CaixasController.update);
router.delete('/caixas/:id', authenticate, requireAdmin, CaixasController.delete);

export default router;
