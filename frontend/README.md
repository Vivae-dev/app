# Vivae - Frontend (React + Vite)

Este é o aplicativo React do Vivae, construído com foco em uma UI moderna e premium (Glassmorphism), conectando-se na nossa arquitetura de microsserviços do backend.

## Configuração do Workspace

1. Como este projeto consome os microsserviços do Backend, é necessário definir o caminho de cada um nas variáveis de ambiente.
2. Copie o arquivo `.env.example` criando um novo `.env`:

```bash
cp .env.example .env
```

3. O frontend automaticamente usará a porta 5173 restrita (`http://localhost:5173`).

## Como rodar o projeto

Instale as dependências uma vez:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

## Como compilar para Produção

```bash
npm run build
```
