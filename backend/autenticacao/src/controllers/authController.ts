import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db';

const generateToken = (id: number, email: string, role: string) =>
	jwt.sign({ id, email, role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

export const AuthController = {
	register: async (req: Request, res: Response) => {
		const { name, email, password, cep, logradouro, complemento } = req.body;

		if (!name || !email || !password) {
			return res.status(400).json({ message: 'Nome, e-mail e senha são obrigatórios.' });
		}

		try {
			const existing = await pool.query(
				'SELECT id_usuario FROM usuarios WHERE email = $1',
				[email],
			);
			if (existing.rows.length > 0) {
				return res.status(409).json({ message: 'Este e-mail já está em uso.' });
			}

			const hashedPassword = await bcrypt.hash(password, 10);

			const result = await pool.query(
				`INSERT INTO usuarios (nome_completo, email, senha_hash, CEP, logradouro, complemento, data_criacao, role)
				 VALUES ($1, $2, $3, $4, $5, $6, NOW(), 'user')
				 RETURNING id_usuario, nome_completo, email, CEP, logradouro, complemento, role`,
				[name, email, hashedPassword, cep ?? null, logradouro ?? null, complemento ?? null],
			);

			const user = result.rows[0];
			const token = generateToken(user.id_usuario, user.email, user.role);

			res.status(201).json({
				id: user.id_usuario,
				name: user.nome_completo,
				email: user.email,
				cep: user.cep,
				logradouro: user.logradouro,
				complemento: user.complemento,
				role: user.role,
				token,
			});
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: 'Erro ao registrar usuário.' });
		}
	},

	login: async (req: Request, res: Response) => {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
		}

		try {
			const result = await pool.query(
				`SELECT id_usuario, nome_completo, email, senha_hash, CEP, logradouro, complemento, role
				 FROM usuarios WHERE email = $1`,
				[email],
			);

			if (result.rows.length === 0) {
				return res.status(401).json({ message: 'Credenciais inválidas.' });
			}

			const user = result.rows[0];
			const passwordMatch = await bcrypt.compare(password, user.senha_hash);

			if (!passwordMatch) {
				return res.status(401).json({ message: 'Credenciais inválidas.' });
			}

			const token = generateToken(user.id_usuario, user.email, user.role);

			res.json({
				id: user.id_usuario,
				name: user.nome_completo,
				email: user.email,
				cep: user.cep,
				logradouro: user.logradouro,
				complemento: user.complemento,
				role: user.role,
				token,
			});
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: 'Erro ao fazer login.' });
		}
	},
};
