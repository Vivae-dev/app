# Vivae - Backend

Esta pasta contém o código da API backend para o Vivae. Construído com Node.js, Express e TypeScript.

## Scripts Disponíveis

### `npm install`

Instala todas as dependências.

### `npm run dev`

Roda o app em modo de desenvolvimento usando `ts-node-dev`.
O servidor irá reiniciar se você fizer edições em `src/index.ts`.
Por padrão, a API estará disponível em [http://localhost:3001](http://localhost:3001).

### `npm run build`

Compila o código TypeScript para a pasta `dist`.

### `npm start`

Inicia a aplicação Node.js compilada a partir da pasta `dist`.

## Endpoints

- `GET /api/health`: Retorna um status simples de verificação de integridade.
