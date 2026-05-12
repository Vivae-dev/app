const path = require('path');
const { Pool } = require(path.join(__dirname, '../backend/node_modules/pg'));

require(path.join(__dirname, '../backend/node_modules/dotenv')).config({
	path: path.join(__dirname, '../backend/autenticacao/.env'),
});

const pool = new Pool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	port: parseInt(process.env.DB_PORT),
	ssl: { rejectUnauthorized: false },
});

const tables = ['usuarios', 'produtos', 'materiais', 'composicao_produtos', 'pedidos', 'caixas'];

async function viewDB() {
	for (const table of tables) {
		try {
			const result = await pool.query(`SELECT * FROM ${table} LIMIT 50`);
			console.log('\n' + '='.repeat(60));
			console.log(`TABLE: ${table} (${result.rowCount} rows)`);
			console.log('='.repeat(60));
			if (result.rows.length === 0) {
				console.log('  (vazio)');
			} else {
				const rows = result.rows.map(r => {
					if (r.senha_hash) r.senha_hash = '[HASH]';
					return r;
				});
				console.table(rows);
			}
		} catch (err) {
			console.log(`TABLE: ${table} — ERRO: ${err.message}`);
		}
	}
	await pool.end();
}

viewDB();
