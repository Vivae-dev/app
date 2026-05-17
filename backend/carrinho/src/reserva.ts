import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const port = parseInt(process.env.RESERVA_PORT || '8003', 10);

const pool = new Pool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	port: parseInt(process.env.DB_PORT || '5432'),
	ssl: { rejectUnauthorized: false },
});

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

app.get('/api/health', (req, res) => {
	res.json({
		status: 'ok',
		mensagem: 'Microsserviço de Reservas está rodando',
	});
});

app.get('/api/users/:id/address', authenticate, async (req: AuthRequest, res) => {
	try {
		const result = await pool.query(
			'SELECT CEP, logradouro, numero_casa, complemento FROM usuarios WHERE id_usuario = $1',
			[req.params.id],
		);
		if (result.rows.length === 0) {
			return res.status(404).json({ message: 'Usuário não encontrado.' });
		}
		const r = result.rows[0];
		res.json({
			cep: r.cep,
			rua: r.logradouro,
			numero: r.numero_casa,
			complemento: r.complemento,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Erro ao buscar endereço.' });
	}
});

app.post('/api/reservas', authenticate, async (req: AuthRequest, res) => {
	const { experienceId, experienceName, price, address } = req.body;

	if (!experienceId) {
		return res.status(400).json({ error: 'ID da experiência é obrigatório' });
	}

	try {
		if (address) {
			await pool.query(
				`UPDATE usuarios SET CEP = $1, logradouro = $2, numero_casa = $3, complemento = $4
				 WHERE id_usuario = $5`,
				[
					address.cep ?? null,
					address.rua ?? null,
					address.numero ?? null,
					address.complemento ?? null,
					req.user!.id,
				],
			);
		}

		const pedidoResult = await pool.query(
			`INSERT INTO pedidos (id_usuario, data_reserva, valor_total, estado)
			 VALUES ($1, NOW(), $2, 'pago')
			 RETURNING id_pedido, data_reserva`,
			[req.user!.id, price],
		);

		const pedido = pedidoResult.rows[0];

		res.status(201).json({
			message: 'Reserva confirmada!',
			reserva: {
				id: pedido.id_pedido,
				userId: req.user!.id,
				experienceId,
				experienceName,
				price,
				status: 'pago',
				createdAt: pedido.data_reserva,
			},
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Erro ao criar reserva.' });
	}
});

app.listen(port, () => {
	console.log(`Microsserviço de Reservas rodando na porta ${port}`);
});
