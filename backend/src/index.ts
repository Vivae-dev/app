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
	res.json({ status: 'ok', mensagem: 'Backend do Vivae está rodando' });
});

app.listen(port, () => {
	console.log(`Servidor backend Vivae rodando na porta ${port}`);
});
