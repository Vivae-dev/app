import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(
	cors({
		origin: process.env.FRONT_URL || 'http://localhost:5173',
	}),
);
app.use(express.json());

app.get('/api/health', (req, res) => {
	res.json({
		status: 'ok',
		mensagem: 'Microsserviço de Catálogo está rodando',
	});
});

app.get('/api/produtos', (req, res) => {
	res.json([
		{
			id: 1,
			name: 'Salto de Paraquedas',
			price: 599.0,
			image:
				'https://images.unsplash.com/photo-1533560271113-92b67fd31792?auto=format&fit=crop&q=80&w=800',
		},
		{
			id: 2,
			name: 'Jantar Romântico nas Nuvens',
			price: 850.0,
			image:
				'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800',
		},
		{
			id: 3,
			name: 'Aula de Surf Particular',
			price: 150.0,
			image:
				'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&q=80&w=800',
		},
	]);
});

app.listen(port, () => {
	console.log(`Microsserviço de Catálogo rodando na porta ${port}`);
});
