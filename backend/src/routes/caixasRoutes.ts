import { Router } from 'express';
import { CaixasController } from '../controllers/caixasController';

const router = Router();
router.get('/health', (req, res) => {
	res.json({
		status: 'ok',
		mensagem: 'Microsserviço de Catálogo está rodando',
	});
});

router.get('/caixas', CaixasController.getAll);
router.get('/caixas/:id', CaixasController.getById);
router.post('/caixas', CaixasController.create);
router.put('/caixas/:id', CaixasController.update);
router.delete('/caixas/:id', CaixasController.delete);

export default router;
