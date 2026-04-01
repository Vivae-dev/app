import { Request, Response } from 'express';
import { Box } from '../models/Box';

let boxes: Box[] = [
	{
		id: 1,
		name: 'Plano Mensal: Um Novo Hobby',
		description:
			'A cada mês, receba um kit 100% surpresa com tudo o que você precisa para aprender uma nova habilidade do zero!',
		type: 'ASSINATURA',
		price: 89.9,
		image:
			'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&auto=format&fit=crop',
		stock: 100,
	},
	{
		id: 2,
		name: 'Caixa Antiga: Cerâmica Artesanal',
		description:
			'Hobby do mês passado! Leve para casa argila, ferramentas de escultura e tintas para modelar e pintar sua própria caneca.',
		type: 'AVULSA',
		price: 110.0,
		image:
			'https://plus.unsplash.com/premium_photo-1678382344509-ed0ff45be16b?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
		stock: 15,
	},
	{
		id: 3,
		name: 'Caixa Antiga: Cultivo Botânico',
		description:
			'Nostalgia Pura. Tudo o que você precisa para começar a sua horta indoor: Sementes especiais, vasos orgânicos e manual de germinação.',
		type: 'AVULSA',
		price: 95.5,
		image:
			'https://images.unsplash.com/photo-1590605105526-5c08f63f89aa?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
		stock: 5,
	},
];


export const CaixasController = {
	getAll(req: Request, res: Response) {
		const { type } = req.query;
		if (type) {
			const filteredBoxes = boxes.filter(
				(b) => b.type === String(type).toUpperCase(),
			);
			return res.json(filteredBoxes);
		}
		res.json(boxes);
	},

	getById(req: Request, res: Response) {
		const id = parseInt(req.params.id as string);
		const box = boxes.find((b) => b.id === id);

		if (!box) {
			return res.status(404).json({ message: 'Caixa não encontrada' });
		}
		res.json(box);
	},

	create(req: Request, res: Response) {
		const { name, description, type, price, image, stock } = req.body;

		if (!name || !price || !type) {
			return res
				.status(400)
				.json({ message: 'Campos nome, preço e tipo são obrigatórios.' });
		}

		const newBox: Box = {
			id: boxes.length > 0 ? Math.max(...boxes.map((b) => b.id)) + 1 : 1,
			name,
			description: description || '',
			type,
			price,
			image: image || '',
			stock: stock || 0,
		};

		boxes.push(newBox);

		res.status(201).json(newBox);
	},

	update(req: Request, res: Response) {
		const id = parseInt(req.params.id as string);
		const boxIndex = boxes.findIndex((b) => b.id === id);

		if (boxIndex === -1) {
			return res.status(404).json({ message: 'Caixa não encontrada' });
		}

		const updatedBox: Box = {
			...boxes[boxIndex],
			...req.body,
			id,
		};

		boxes[boxIndex] = updatedBox;
		res.json(updatedBox);
	},

	delete(req: Request, res: Response) {
		const id = parseInt(req.params.id as string);
		const boxIndex = boxes.findIndex((b) => b.id === id);

		if (boxIndex === -1) {
			return res.status(404).json({ message: 'Caixa não encontrada' });
		}

		boxes.splice(boxIndex, 1);
		res.status(204).send();
	},
};
