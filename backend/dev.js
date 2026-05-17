const { spawn } = require('child_process');
const path = require('path');

const services = [
  { name: 'auth',     dir: 'autenticacao'      },
  { name: 'catalogo', dir: 'listagem_produtos'  },
  { name: 'carrinho', dir: 'carrinho'           },
];

const colors = ['\x1b[34m', '\x1b[32m', '\x1b[33m'];
const reset = '\x1b[0m';

services.forEach(({ name, dir }, i) => {
  const color = colors[i];
  const cwd = path.join(__dirname, dir);
  const proc = spawn('npm', ['run', 'dev'], { cwd, shell: true });

  const prefix = `${color}[${name}]${reset} `;
  proc.stdout.on('data', d => d.toString().split('\n').forEach(l => l && console.log(prefix + l)));
  proc.stderr.on('data', d => d.toString().split('\n').forEach(l => l && console.error(prefix + l)));
  proc.on('exit', code => console.log(`${color}[${name}] exited (${code})${reset}`));
});
