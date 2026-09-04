# Vivae - Backend (Monorepo de Microsserviços)

Microsserviços Express + TypeScript sob Domain-Driven Design.

## Estrutura de Microsserviços

| Serviço       | Diretório           | Porta |
| ------------- | ------------------- | ----- |
| Autenticação  | `autenticacao/`     | 8002  |
| Catálogo      | `listagem_produtos/`| 8001  |
| Carrinho      | `carrinho/`         | 8003  |
| Pagamento     | `pagamento/`        | 8004  |

## Configuração de Ambiente

Cada serviço carrega dois arquivos `.env` em ordem de prioridade:

1. **Próprio** (`<serviço>/.env`) — porta do serviço
2. **Raiz** (`backend/.env`) — vars compartilhadas (DB, JWT, SMTP, FRONT_URL)

### Estrutura dos `.env`

| Arquivo                       | Conteúdo                          |
| ----------------------------- | --------------------------------- |
| `backend/.env`                | DB, JWT_SECRET, SMTP, FRONT_URL   |
| `autenticacao/.env`           | `AUTH_PORT=8002`                  |
| `listagem_produtos/.env`      | `CATALOG_PORT=8001`               |
| `carrinho/.env`               | `RESERVA_PORT=8003`               |
| `pagamento/.env`              | `PAGAMENTO_PORT=8004`             |

### Primeiro uso

O `npm run setup` copia automaticamente todos os `.env.example` para `.env` (onde ainda não existam):

```bash
npm run setup
```

Em seguida, edite `backend/.env` com as credenciais reais:

```env
JWT_SECRET=troque_este_segredo
DB_HOST=seu_host.aivencloud.com
DB_USER=avnadmin
DB_PASSWORD=sua_senha_aqui
DB_NAME=defaultdb
DB_PORT=28717
```

Para gerar credenciais SMTP de teste (Ethereal):

```bash
node scripts/setup-ethereal.js
```

Cole os valores gerados no bloco SMTP do `backend/.env`.

## Como Rodar

```bash
npm run setup   # copia .env.examples + instala deps (só na primeira vez)
npm run dev     # sobe todos os serviços simultaneamente
```

## Banco de Dados

Hospedado no Aiven (PostgreSQL). Schema em `../database/create-tables.sql`.

## Docker

Cada microsserviço tem seu próprio `Dockerfile`; `docker-compose.yml` orquestra os cinco.

```bash
cd backend
docker compose up --build
```

Sobe `catalogo` (8001), `auth` (8002), `carrinho` (8003), `pagamento` (8004) e `barramento` (9000), todos lendo credenciais de `backend/.env` (`env_file`). Dentro do compose, os serviços se enxergam pelo nome (`http://catalogo:8001`, etc.) em vez de `localhost` — o `barramento` usa as vars `CATALOGO_URL`, `AUTH_URL` e `RESERVA_URL` pra isso.

```bash
docker compose down   # para e remove os containers
```

---

## Rotas da API

### Autenticação — `http://localhost:8002`

| Método | Rota                         | Auth | Descrição                                      |
| ------ | ---------------------------- | ---- | ---------------------------------------------- |
| `GET`  | `/api/health`                | —    | Status do serviço                              |
| `POST` | `/api/auth/register`         | —    | Cadastra usuário e envia e-mail de confirmação |
| `POST` | `/api/auth/login`            | —    | Login; retorna JWT (conta deve estar ativa)    |
| `GET`  | `/api/auth/confirmar/:token` | —    | Ativa conta pelo token recebido por e-mail     |

**Body — `POST /api/auth/register`**

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "cep": "string (opcional)",
  "logradouro": "string (opcional)",
  "numeroCasa": "string (opcional)",
  "complemento": "string (opcional)"
}
```

**Body — `POST /api/auth/login`**

```json
{ "email": "string", "password": "string" }
```

---

### Catálogo de Produtos — `http://localhost:8001`

| Método   | Rota              | Auth  | Descrição                                        |
| -------- | ----------------- | ----- | ------------------------------------------------ |
| `GET`    | `/api/health`     | —     | Status do serviço                                |
| `GET`    | `/api/caixas`     | —     | Lista caixas (query: `?type=ASSINATURA\|AVULSA`) |
| `GET`    | `/api/caixas/:id` | —     | Busca caixa por ID                               |
| `POST`   | `/api/caixas`     | admin | Cria nova caixa                                  |
| `PUT`    | `/api/caixas/:id` | admin | Atualiza caixa                                   |
| `DELETE` | `/api/caixas/:id` | admin | Remove caixa                                     |

**Body — `POST/PUT /api/caixas`**

```json
{
  "name": "string",
  "description": "string (opcional)",
  "type": "ASSINATURA | AVULSA",
  "price": "number",
  "image": "string (opcional)",
  "stock": "number (opcional)"
}
```

---

### Carrinho/Reservas — `http://localhost:8003`

| Método | Rota                      | Auth | Descrição                         |
| ------ | ------------------------- | ---- | --------------------------------- |
| `GET`  | `/api/health`             | —    | Status do serviço                 |
| `GET`  | `/api/reservas`           | JWT  | Lista pedidos do usuário logado   |
| `POST` | `/api/reservas`           | JWT  | Cria reserva                      |
| `GET`  | `/api/users/:id/address`  | JWT  | Retorna endereço salvo do usuário |

**Body — `POST /api/reservas`**

```json
{
  "experienceId": "number",
  "experienceName": "string",
  "price": "number",
  "address": {
    "cep": "string",
    "rua": "string",
    "numero": "string",
    "complemento": "string (opcional)"
  }
}
```

**Response — `GET /api/reservas`**

```json
[
  {
    "id_pedido": 1,
    "data_reserva": "2025-05-25T00:00:00.000Z",
    "valor_total": 149.9,
    "estado": "pago"
  }
]
```

---

### Pagamento (mock) — `http://localhost:8004`

| Método | Rota            | Auth | Descrição                         |
| ------ | --------------- | ---- | --------------------------------- |
| `GET`  | `/api/health`   | —    | Status do serviço                 |
| `POST` | `/api/pagamento`| —    | Processa pagamento (sempre aprova)|

**Body — `POST /api/pagamento`**

```json
{
  "amount": "number",
  "cardNumber": "string",
  "cardName": "string",
  "cardExpiry": "string",
  "cardCvv": "string"
}
```

**Response**

```json
{
  "success": true,
  "transactionId": "VIV-XXXXXXXX",
  "amount": 149.9,
  "last4": "1234",
  "message": "Pagamento aprovado."
}
```
