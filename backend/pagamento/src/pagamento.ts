import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const port = parseInt(process.env.PAGAMENTO_PORT || '8004', 10);
const host = process.env.HOST || 'localhost';

app.use(cors({ origin: process.env.FRONT_URL || 'http://localhost:8000' }));
app.use(express.json());

function generateTransactionId(): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	const rand = Array.from(
		{ length: 8 },
		() => chars[Math.floor(Math.random() * chars.length)],
	).join('');
	return `VIV-${rand}`;
}

app.get('/api/health', (_req: Request, res: Response) => {
	res.json({
		status: 'ok',
		mensagem: 'Microsserviço de Pagamento está rodando',
	});
});

app.post('/api/pagamento', (req: Request, res: Response) => {
	const { amount, cardNumber, cardName, cardExpiry, cardCvv } = req.body;

	if (!amount || !cardNumber || !cardName || !cardExpiry || !cardCvv) {
		res.status(400).json({ error: 'Dados do cartão incompletos.' });
		return;
	}

	const last4 = String(cardNumber).replace(/\s/g, '').slice(-4);

	// Simula processamento (sempre aprova no mock)
	setTimeout(() => {
		res.status(200).json({
			success: true,
			transactionId: generateTransactionId(),
			amount,
			last4,
			message: 'Pagamento aprovado.',
		});
	}, 800);
});

app.listen(port, host, () => {
	console.log(`Microsserviço de Pagamento rodando em http://${host}:${port}`);
});
