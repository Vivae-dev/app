import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export interface AuthRequest extends Request {
	user?: { id: number; email: string; role: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
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

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
	if (req.user?.role !== 'admin') {
		res.status(403).json({ message: 'Acesso restrito a administradores.' });
		return;
	}
	next();
};
