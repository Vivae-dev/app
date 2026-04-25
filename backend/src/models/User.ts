export interface User {
	id?: number;
	name: string;
	email: string;
	password: string;
	address?: string;
	role?: 'user' | 'admin';
	createdAt: Date;
}
