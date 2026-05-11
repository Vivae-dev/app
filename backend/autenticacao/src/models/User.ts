export interface User {
	id?: number;
	name: string;
	email: string;
	password: string;
	cep?: string;
	logradouro?: string;
	complemento?: string;
	role?: 'user' | 'admin';
	createdAt: Date;
}
