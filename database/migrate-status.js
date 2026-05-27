const path = require('path');
const { Pool } = require(path.join(__dirname, '../backend/autenticacao/node_modules/pg'));
require(path.join(__dirname, '../backend/autenticacao/node_modules/dotenv')).config({
	path: path.join(__dirname, '../backend/.env'),
});

const pool = new Pool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	port: parseInt(process.env.DB_PORT),
	ssl: { rejectUnauthorized: false },
});

pool.query("ALTER TYPE status_pedido ADD VALUE IF NOT EXISTS 'separando' AFTER 'pago'")
	.then(() => { console.log('OK: separando adicionado'); pool.end(); })
	.catch(e => { console.error(e.message); pool.end(); });
