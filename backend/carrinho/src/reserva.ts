import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

dotenv.config({ path: path.join(__dirname, '../.env'),  override: true });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const port = parseInt(process.env.RESERVA_PORT || '8003', 10);
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

interface Endereco {
	cep : string | null,
	logradouro : string | null,
	numero_casa : string | null,
	complemento : string | null
}

const auxEndereco = {} as Endereco;
let esperar : boolean = false;

const funcoesDoBarramento = {
  RespostaCaixa: async (caixa : any[]) => {
		try {
			for (let i = 0; i < caixa.length; i++) {
				await pool.query(
				`
				INSERT INTO caixas_cache (
					id,
					nome,
					imagem
				)
				VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome, imagem = EXCLUDED.imagem;
				`,
				[
					caixa[i].id,
					caixa[i].nome,
					caixa[i].imagem
				]
			);}
			esperar = true;
		} catch (err) {
			console.error(err);
		}
	},
	RespostaGetEndereco : async (result : Endereco) => {
		auxEndereco.cep = result.cep;
		auxEndereco.complemento = result.complemento;
		auxEndereco.logradouro = result.logradouro;
		auxEndereco.numero_casa = result.numero_casa;
	},
	CancelarPedido : async (ids : any[] ) => {
		 const result = await pool.query(
            'DELETE FROM pedidos WHERE id_pedido = $1 AND id_usuario = $2 RETURNING id_pedido',
            [ids[0], ids[1]]
        );
	}
};

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



const espera = async (): Promise<void> => {
    while (esperar == false){
		console.log('esperando true');
	}
	console.log('saiu do while');
};

//Recebe os eventos e redireciona para o funções do barramento, que separa pelo tipo e executa a função correspondente
app.post("/api/eventos", async (req, res) => {
	try{
		const tipo = req.body.tipo as keyof typeof funcoesDoBarramento;
		await funcoesDoBarramento[tipo](req.body.dados);
		res.status(200).send({ msg: "ok" });
	} catch (err){
		res.status(200).send({ msg: "ok" });
	}
}); 

//olhar pedidos
app.get('/api/reservas', authenticate, async (req: AuthRequest, res) => {
	try {

		const aux = await pool.query('SELECT id_caixa FROM pedidos WHERE id_usuario = $1 ORDER BY data_reserva DESC', [req.user!.id],);

		await axios.post("http://localhost:10000/eventos", {
			tipo: "GetPedidos",
			dados : aux.rows
		});

		await espera;

		const result = await pool.query(
			`SELECT id_pedido, data_reserva, valor_total, estado,
			        id_caixa, c.nome AS nome_experiencia, c.imagem
			 FROM pedidos p
			 LEFT JOIN caixas_cache c ON c.id = p.id_caixa
			 WHERE p.id_usuario = $1
			 ORDER BY p.data_reserva DESC`,
			[req.user!.id],
		);
		res.json(result.rows);
		esperar = false;
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Erro ao buscar pedidos.' });
	}
});

app.get('/api/health', (req, res) => {
	res.json({
		status: 'ok',
		mensagem: 'Microsserviço de Reservas está rodando',
	});
});

//buscar endereço
app.get('/api/users/:id/address', authenticate, async (req: AuthRequest, res) => {
	try {

		const evento = await axios.post("http://localhost:10000/eventos", {
			tipo: "GetEndereco",
			dados : req.params.id
		});

		if (auxEndereco == null) {
			return res.status(404).json({ message: 'Usuário não encontrado.' });
		}

		const r = auxEndereco;
		res.json({
			cep: r.cep,
			rua: r.logradouro,
			numero: r.numero_casa,
			complemento: r.complemento,
		});

		//reseta o objeto auxiiar
		auxEndereco.cep = null;
		auxEndereco.complemento = null;
		auxEndereco.logradouro = null;
		auxEndereco.numero_casa = null;

	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Erro ao buscar endereço.' });
	}
});

app.post('/api/reservas', authenticate, async (req: AuthRequest, res) => {
	const { experienceId, experienceName, price, address } = req.body;

	if (!experienceId) {
		return res.status(400).json({ error: 'ID da experiência é obrigatório' });
	}

	try {
		if (address) {
		const evento = await axios.post("http://localhost:10000/eventos", {
			tipo: "SetEndereco",
			dados : [address, req.user!.id]
		});
		}

		//novo pedido
		const pedidoResult = await pool.query(
			`INSERT INTO pedidos (id_usuario, data_reserva, valor_total, estado, id_caixa)
			 VALUES ($1, NOW(), $2, 'pago', $3)
			 RETURNING id_pedido, data_reserva`,
			[req.user!.id, price, experienceId],
		);

		const pedido = pedidoResult.rows[0];

		res.status(201).json({
			message: 'Reserva confirmada!',
			reserva: {
				id: pedido.id_pedido,
				userId: req.user!.id,
				experienceId,
				experienceName,
				price,
				status: 'pago',
				createdAt: pedido.data_reserva,
			},
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Erro ao criar reserva.' });
	}
});

app.listen(port, host, () => {
	console.log(`Microsserviço de Reservas rodando em http://${host}:${port}`);
});
