import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import caixasRoutes from './routes/caixasRoutes';

dotenv.config();

const app = express();
const port = parseInt(process.env.CATALOG_PORT || '8001');
const host = process.env.HOST || 'localhost';

app.use(
	cors({
		origin: process.env.FRONT_URL || 'http://localhost:5173',
	}),
);
app.use(express.json());

app.use('/api', caixasRoutes);

app.listen(port, host, () => {
	console.log(`Microsserviço de Catálogo rodando em http://${host}:${port}`);
});
