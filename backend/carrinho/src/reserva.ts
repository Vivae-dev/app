import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const port = parseInt(process.env.RESERVA_PORT || '8003', 10);

app.use(
	cors({
		origin: process.env.FRONT_URL || 'http://localhost:8000',
	}),
);
app.use(express.json());

interface AuthRequest extends Request {
	user?: { id: number; email: string; role: string };
}

const authenticate = (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): void => {
	const token = req.headers.authorization?.split(' ')[1];

	if (!token) {
		res.status(401).json({ message: 'Token não fornecido.' });
		return;
	}

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
			id: number;
			email: string;
			role: string;
		};
		req.user = payload;
		next();
	} catch {
		res.status(401).json({ message: 'Token inválido ou expirado.' });
	}
};

// TODO: implementar GET /api/reservas para listar reservas do usuário autenticado
// TODO: implementar GET /api/users/:id/address — o frontend já chama este endpoint
const reservas: any[] = [];

app.get('/api/health', (req, res) => {
	res.json({
		status: 'ok',
		mensagem: 'Microsserviço de Reservas está rodando',
	});
});

app.post('/api/reservas', authenticate, (req: AuthRequest, res) => {
	const { experienceId, experienceName, price } = req.body;

	if (!experienceId) {
		return res.status(400).json({ error: 'ID da experiência é obrigatório' });
	}

	const novaReserva = {
		id: reservas.length + 1,
		userId: req.user!.id,
		experienceId,
		experienceName,
		price,
		status: 'CONFIRMADA',
		createdAt: new Date(),
	};

	reservas.push(novaReserva);
	console.log('Nova reserva recebida no microsserviço:', novaReserva);

	res.status(201).json({
		message: 'Reserva confirmada!',
		reserva: novaReserva,
	});
});

app.listen(port, () => {
	console.log(`Microsserviço de Reservas rodando na porta ${port}`);
});
