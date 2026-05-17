export interface User {
	id?: number;
	name: string;
	email: string;
	password: string;
	cep?: string;
	logradouro?: string;
	numeroCasa?: string;
	complemento?: string;
	role?: 'user' | 'admin';
	ativo?: boolean;
	createdAt: Date;
}
