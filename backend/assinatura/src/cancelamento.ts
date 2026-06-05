import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import axios from 'axios';

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();

const port = parseInt(process.env.CANCELAMENTO_PORT || '8005', 10);
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

app.delete('/api/cancelamento/:id', authenticate, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;

        await axios.post("http://localhost:10000/eventos", {
			tipo: "CancelarPedido",
			dados : [id, req.user!.id]
		});
        
        /*
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Pedido não encontrado ou você não tem permissão para cancelá-lo.' });
        } */

        res.json({ message: 'Pedido cancelado com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao cancelar o pedido.' });
    }
});

// Inicialização do Servidor
app.listen(port, host, () => {
    console.log(`Microsserviço de Cancelamento rodando em http://${host}:${port}`);
});