import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const port = parseInt(process.env.AUTH_PORT || '8002', 10);
const host = process.env.HOST || 'localhost';

app.use(
	cors({
		origin: process.env.FRONT_URL || 'http://localhost:8000',
	}),
);
app.use(express.json());

app.use('/api/auth', authRoutes);

app.listen(port, host, () => {
	console.log(
		`Microsserviço de Autenticação rodando em http://${host}:${port}`,
	);
});
