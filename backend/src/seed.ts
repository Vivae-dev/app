import bcrypt from 'bcryptjs';
import pool from './db';

async function seed() {
	await pool.query(
		`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'`,
	);

	const email = 'admin@vivae.com';

	const existing = await pool.query(
		'SELECT id_usuario FROM usuarios WHERE email = $1',
		[email],
	);

	if (existing.rows.length > 0) {
		console.log('Admin já existe:', email);
		process.exit(0);
	}

	const hash = await bcrypt.hash('admin123', 10);

	await pool.query(
		`INSERT INTO usuarios (nome_completo, email, senha_hash, role, data_criacao)
		 VALUES ('Admin', $1, $2, 'admin', NOW())`,
		[email, hash],
	);

	console.log('Admin criado com sucesso!');
	console.log('  Email: admin@vivae.com');
	console.log('  Senha: admin123');
	console.log('  (Altere a senha após o primeiro acesso)');
	process.exit(0);
}

seed().catch((err) => {
	console.error('Erro ao criar admin:', err);
	process.exit(1);
});
