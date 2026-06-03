import express, { Request, Response } from 'express';
import axios from 'axios';
import pool from '../db';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

const toBox = (r: any) => ({
	id: r.id,
	name: r.nome,
	description: r.descricao,
	type: r.tipo,
	price: r.preco,
	image: r.imagem,
	stock: r.estoque,
});

interface caixaInfos{
	id : number,
	nome: string,
	imagem : string
}

const caixas: caixaInfos[] = [];

const funcoesDoBarramento = {
  GetPedidos: async (ids_caixas : any[]) => {
		try {
			for (let i = 0; i < ids_caixas.length; i++) {
				const result = await pool.query('SELECT nome, imagem FROM caixas WHERE id = $1', [
				ids_caixas[i].id_caixa,
			]);
			if (result.rows.length > 0) {
                    caixas.push({
						id : ids_caixas[i].id_caixa,
                        nome: result.rows[0].nome,
                        imagem: result.rows[0].imagem
                    });
            }
			}
		} catch (err) {
			console.error(err);
		}
	}
};


export const CaixasController = {
	async getAll(req: Request, res: Response) {
		const { type } = req.query;
		try {
			const query = type
				? {
						text: 'SELECT * FROM caixas WHERE tipo = $1 ORDER BY id',
						values: [String(type).toUpperCase()],
					}
				: { text: 'SELECT * FROM caixas ORDER BY id', values: [] };
			const result = await pool.query(query);
			res.json(result.rows.map(toBox));
		} catch (err) {
			res.status(500).json({ message: 'Erro ao buscar caixas.' });
		}
	},

	async getById(req: Request, res: Response) {
		try {
			const result = await pool.query('SELECT * FROM caixas WHERE id = $1', [
				req.params.id,
			]);
			if (result.rows.length === 0) {
				return res.status(404).json({ message: 'Caixa não encontrada' });
			}
			res.json(toBox(result.rows[0]));
		} catch (err) {
			res.status(500).json({ message: 'Erro ao buscar caixa.' });
		}
	},

	async create(req: Request, res: Response) {
		const { name, description, type, price, image, stock } = req.body;
		if (!name || !price || !type) {
			return res
				.status(400)
				.json({ message: 'Campos nome, preço e tipo são obrigatórios.' });
		}
		try {
			const result = await pool.query(
				`INSERT INTO caixas (nome, descricao, tipo, preco, imagem, estoque)
				 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
				[name, description || '', type, price, image || '', stock || 0],
			);
			res.status(201).json(toBox(result.rows[0]));
		} catch (err) {
			res.status(500).json({ message: 'Erro ao criar caixa.' });
			console.log(err);
		}
	},

	async update(req: Request, res: Response) {
		const { name, description, type, price, image, stock } = req.body;
		try {
			const current = await pool.query('SELECT * FROM caixas WHERE id = $1', [
				req.params.id,
			]);
			if (current.rows.length === 0) {
				return res.status(404).json({ message: 'Caixa não encontrada' });
			}
			const c = current.rows[0];
			const result = await pool.query(
				`UPDATE caixas SET nome=$1, descricao=$2, tipo=$3, preco=$4, imagem=$5, estoque=$6
				 WHERE id=$7 RETURNING *`,
				[
					name ?? c.nome,
					description ?? c.descricao,
					type ?? c.tipo,
					price ?? c.preco,
					image ?? c.imagem,
					stock ?? c.estoque,
					req.params.id,
				],
			);
			res.json(toBox(result.rows[0]));
		} catch (err) {
			res.status(500).json({ message: 'Erro ao atualizar caixa.' });
		}
	},

	async delete(req: Request, res: Response) {
		try {
			const result = await pool.query(
				'DELETE FROM caixas WHERE id = $1 RETURNING id',
				[req.params.id],
			);
			if (result.rowCount === 0) {
				return res.status(404).json({ message: 'Caixa não encontrada' });
			}
			res.json({ message: 'Caixa deletada.' });
		} catch (err) {
			res.status(500).json({ message: 'Erro ao deletar caixa.' });
		}
	},

	async evento(req: Request, res: Response){
		try{
			const tipo = req.body.tipo as keyof typeof funcoesDoBarramento;
			await funcoesDoBarramento[tipo](req.body.dados);
			await axios.post("http://localhost:10000/eventos", {
				tipo: "RespostaCaixa",
				dados : caixas
			});
		} catch (err){
			res.status(200).send({ msg: "ok" });
		}

	}
};
