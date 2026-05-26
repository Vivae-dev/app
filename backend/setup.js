const { execSync } = require('child_process');
const { copyFileSync, existsSync } = require('fs');
const path = require('path');

const services = ['autenticacao', 'listagem_produtos', 'carrinho', 'pagamento'];

// Copia .env.example -> .env onde .env não existe ainda
const envTargets = [
	{ example: '.env.example', dest: '.env' },
	...services.map((dir) => ({
		example: path.join(dir, '.env.example'),
		dest: path.join(dir, '.env'),
	})),
];

console.log('\n[setup] Verificando arquivos .env...');
envTargets.forEach(({ example, dest }) => {
	if (!existsSync(dest) && existsSync(example)) {
		copyFileSync(example, dest);
		console.log(`  copiado: ${example} -> ${dest}`);
	}
});

// Instala deps de cada serviço
services.forEach((dir) => {
	console.log(`\n[setup] Instalando ${dir}...`);
	execSync('npm install', { cwd: path.join(__dirname, dir), stdio: 'inherit' });
});

console.log(
	'\n[setup] Finalizado. Edite backend/.env com suas credenciais e rode: npm run dev\n',
);
