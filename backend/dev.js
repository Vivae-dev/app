const { spawn } = require('child_process');
const path = require('path');

const services = [
  { name: 'auth',     dir: 'autenticacao'      },
  { name: 'catalogo', dir: 'listagem_produtos'  },
  { name: 'carrinho', dir: 'carrinho'           },
  { name: 'pagamento', dir: 'pagamento' },
  { name: 'cancelar',   dir: 'assinatura'},
  { name: 'barramento', dir: 'barramento'},
];

const colors = ['\x1b[34m', '\x1b[32m', '\x1b[33m',  '\x1b[35m', '\x1b[36m', '\x1b[38;5;208m'];
const reset = '\x1b[0m';

services.forEach(({ name, dir }, i) => {
	const color = colors[i];
	const cwd = path.join(__dirname, dir);
	const proc = spawn('npm', ['run', 'dev'], { cwd, shell: true });

	const prefix = `${color}[${name}]${reset} `;
	const sanitize = (l) => {
		const stripped = l.replace(/^\[\d+\]\s*/, '').trim();
		if (!stripped) return null;
		if (stripped.startsWith('◇ injected env')) return null;
		if (stripped.includes('// tip:')) return null;
		return stripped;
	};
	proc.stdout.on('data', (d) =>
		d.toString().split('\n').forEach((l) => { const s = sanitize(l); if (s) console.log(prefix + s); }),
	);
	proc.stderr.on('data', (d) =>
		d.toString().split('\n').forEach((l) => { const s = sanitize(l); if (s) console.error(prefix + s); }),
	);
	proc.on('exit', (code) =>
		console.log(`${color}[${name}] exited (${code})${reset}`),
	);
});
