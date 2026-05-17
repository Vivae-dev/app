import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../db';
import { sendConfirmationEmail } from '../email';

const generateToken = (id: number, email: string, role: string) =>
	jwt.sign({ id, email, role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

export const AuthController = {
	register: async (req: Request, res: Response) => {
		const { name, email, password, cep, logradouro, numeroCasa, complemento } = req.body;

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
			const confirmToken = crypto.randomBytes(32).toString('hex');

			await pool.query(
				`INSERT INTO usuarios (nome_completo, email, senha_hash, CEP, logradouro, numero_casa, complemento, data_criacao, role, ativo, token_confirmacao)
				 VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), 'user', FALSE, $8)`,
				[name, email, hashedPassword, cep ?? null, logradouro ?? null, numeroCasa ?? null, complemento ?? null, confirmToken],
			);

			await sendConfirmationEmail(email, confirmToken);

			res.status(201).json({
				message: 'Cadastro realizado. Verifique seu e-mail para ativar a conta.',
			});
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: 'Erro ao registrar usuário.' });
		}
	},

	confirmar: async (req: Request, res: Response) => {
		const { token } = req.params;

		try {
			const result = await pool.query(
				`UPDATE usuarios SET ativo = TRUE, token_confirmacao = NULL
				 WHERE token_confirmacao = $1 AND ativo = FALSE
				 RETURNING id_usuario, nome_completo, email, CEP, logradouro, numero_casa, complemento, role`,
				[token],
			);

			if (result.rows.length === 0) {
				return res.status(400).json({ message: 'Token inválido ou conta já ativada.' });
			}

			const user = result.rows[0];
			const jwtToken = generateToken(user.id_usuario, user.email, user.role);

			res.json({
				message: 'Conta ativada com sucesso!',
				id: user.id_usuario,
				name: user.nome_completo,
				email: user.email,
				cep: user.cep,
				logradouro: user.logradouro,
				numeroCasa: user.numero_casa,
				complemento: user.complemento,
				role: user.role,
				token: jwtToken,
			});
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: 'Erro ao confirmar conta.' });
		}
	},

	login: async (req: Request, res: Response) => {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
		}

		try {
			const result = await pool.query(
				`SELECT id_usuario, nome_completo, email, senha_hash, CEP, logradouro, numero_casa, complemento, role, ativo
				 FROM usuarios WHERE email = $1`,
				[email],
			);

			if (result.rows.length === 0) {
				return res.status(401).json({ message: 'Credenciais inválidas.' });
			}

			const user = result.rows[0];

			if (!user.ativo) {
				return res.status(403).json({ message: 'Conta não ativada. Verifique seu e-mail.' });
			}

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
				numeroCasa: user.numero_casa,
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
