import { Request, Response } from 'express';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

let users: User[] = [];
let nextId = 1;

export const AuthController = {
	register: async (req: Request, res: Response) => {
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

		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser: User = {
			name,
			email,
			password: hashedPassword,
			address,
			createdAt: new Date(),
		};


		users.push(newUser);
		console.log(users);

		enviarDados(newUser);
		// Remover a senha antes de retornar os dados
		const { password: _, ...userWithoutPassword } = newUser;

		res.status(201).json(userWithoutPassword);
	},

	login: async (req: Request, res: Response) => {
		const { email, password } = req.body;

		if (!email || !password) {
			return res
				.status(400)
				.json({ message: 'E-mail e senha são obrigatórios.' });
		}

		const user = users.find((u) => u.email === email);

		if (!user) {
			return res.status(401).json({ message: 'Credenciais inválidas.' });
		}
		
		const passwordMatch = await bcrypt.compare(password, user.password);
		
		if (!passwordMatch) {
			return res.status(401).json({ message: 'Credenciais inválidas.' });
		}

		// Remover a senha antes de retornar os dados
		const { password: _, ...userWithoutPassword } = user;

		// TODO: retornar jwt
		res.json(userWithoutPassword);
	},
};

async function enviarDados(usuario : User) {

	try{
		const response = await fetch("http://localhost:3000/cadastro", {
		method: "POST",
		headers: {
		"Content-Type": "application/json"
		},
		body: JSON.stringify(usuario)
		});

		const resultado = await response.json();
		console.log(resultado);
	} catch (err) {
		console.log(err);
	}

}
