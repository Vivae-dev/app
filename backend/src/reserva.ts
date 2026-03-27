import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3002;

app.use(
	cors({
		origin: process.env.FRONT_URL || 'http://localhost:5173',
	}),
);
app.use(express.json());

const reservas: any[] = [];

app.get('/api/health', (req, res) => {
	res.json({
		status: 'ok',
		mensagem: 'Microsserviço de Reservas está rodando',
	});
});

app.post('/api/reservas', (req, res) => {
	const { experienceId, experienceName, price } = req.body;

	if (!experienceId) {
		return res.status(400).json({ error: 'ID da experiência é obrigatório' });
	}

	const novaReserva = {
		id: reservas.length + 1,
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
