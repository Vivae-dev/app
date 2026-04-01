export interface Box {
	id: number;
	name: string;
	description: string;
	type: 'ASSINATURA' | 'AVULSA';
	price: number;
	image: string;
	stock: number;
}
