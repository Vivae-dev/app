import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const port = parseInt(process.env.RESERVA_PORT || '8003', 10);
const host = process.env.HOST || 'localhost';

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

app.get('/api/reservas', authenticate, async (req: AuthRequest, res) => {
	try {
	/*	const caixa = await axios.post("http://localhost:10000/eventos", {
			tipo: "GetCaixa",
			dados : {
				id_usuario : req.user!.id,
			}
		});
		console.log(' '+ caixa); */
		const result = await pool.query(
			`SELECT p.id_pedido, p.data_reserva, p.valor_total, p.estado,
			        p.id_caixa, c.nome AS nome_experiencia, c.imagem
			 FROM pedidos p
			 LEFT JOIN caixas c ON c.id = p.id_caixa
			 WHERE p.id_usuario = $1
			 ORDER BY p.data_reserva DESC`,
			[req.user!.id],
		);
		res.json(result.rows);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Erro ao buscar pedidos.' });
	}
});

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
			`INSERT INTO pedidos (id_usuario, data_reserva, valor_total, estado, id_caixa)
			 VALUES ($1, NOW(), $2, 'pago', $3)
			 RETURNING id_pedido, data_reserva`,
			[req.user!.id, price, experienceId],
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

app.listen(port, host, () => {
	console.log(`Microsserviço de Reservas rodando em http://${host}:${port}`);
});
