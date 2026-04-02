# Vivae - Backend (Monorepo de Microsserviços)

Este repositório contém os microsserviços corporativos do Vivae utilizando Domain-Driven Design (Avançado) sob o framework Express, TypeScript e ferramentas concorrentes.

## Estrutura de Microsserviços

Para organizar e isolar cada contexto do sistema, os microsserviços ficam isolados dentro de `src/`.

- **Catálogo (`src/catalogo/`)**: 1º Microsserviço de gerenciamento do CRUD de Caixas de Assinatura e Caixas Antigas (na porta 8001).
- **Reservas (`src/reserva.ts`)**: Microsserviço provisório para simular a tomada de reservas na porta 3002.

_(Novos microsserviços como Auth, Payment e EventBus serão incorporados nesta estrutura corporativa em breve)_.

## Configuração de Ambiente

Antes de rodar, é necessário apontar em qual porta cada microsserviço operará e qual será a rota de comunicação (CORS) com o Frontend.

Copie o `.env.example` renomeando para `.env`:

```bash
cp .env.example .env
```

## Como Rodar Localmente (Via Terminal Único)

Instale as dependências pela primeira vez:

```bash
npm install
```

Este projeto utiliza a biblioteca `concurrently` para processar e compilar as portas de múltiplos microsserviços independentes usando apenas um único comando. No seu terminal, rode o comando abaixo:

```bash
npm run dev
```

Esse comando irá levantar o Catálogo (porta 8001) e as Reservas (porta 3002) simultaneamente.

## Gerar a Build Final (TypeScript -> JavaScript)

```bash
npm run build
```

Todos os microsserviços serão compilados e minificados para a pasta `dist/` do sistema.
