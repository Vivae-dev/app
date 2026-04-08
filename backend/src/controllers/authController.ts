import { Request, Response } from 'express';
import { User } from '../models/User';

let users: User[] = [];
let nextId = 1;

export const AuthController = {
	register(req: Request, res: Response) {
		const { name, email, password, address } = req.body;

		if (!name || !email || !password) {
			return res
				.status(400)
				.json({ message: 'Nome, e-mail e senha são obrigatórios.' });
		}

		const existingUser = users.find((u) => u.email === email);
		if (existingUser) {
			return res.status(409).json({ message: 'Este e-mail já está em uso.' });
		}

		const newUser: User = {
			id: nextId++,
			name,
			email,
			password, // TODO: usar hash
			address,
			createdAt: new Date(),
		};

		users.push(newUser);
		console.log(users);

		// Remover a senha antes de retornar os dados
		const { password: _, ...userWithoutPassword } = newUser;

		res.status(201).json(userWithoutPassword);
	},

	login(req: Request, res: Response) {
		const { email, password } = req.body;

		if (!email || !password) {
			return res
				.status(400)
				.json({ message: 'E-mail e senha são obrigatórios.' });
		}

		const user = users.find(
			(u) => u.email === email && u.password === password,
		);

		if (!user) {
			return res.status(401).json({ message: 'Credenciais inválidas.' });
		}

		// Remover a senha antes de retornar os dados
		const { password: _, ...userWithoutPassword } = user;

		// TODO: retornar jwt
		res.json(userWithoutPassword);
	},
};
