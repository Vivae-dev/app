# Vivae - Backend (Monorepo de Microsserviços)

Microsserviços Express + TypeScript sob Domain-Driven Design.

## Estrutura de Microsserviços

| Serviço             | Diretório            | Porta | Responsabilidade                               |
| ------------------- | -------------------- | ----- | ---------------------------------------------- |
| Catálogo (produtos) | `listagem_produtos/` | 8001  | CRUD de caixas (tabela `caixas`)               |
| Autenticação        | `autenticacao/`      | 8002  | Cadastro, login e endereço (tabela `usuarios`) |
| Carrinho (pedidos)  | `carrinho/`          | 8003  | CRUD de pedidos (tabela `pedidos`)             |
| Pagamento           | `pagamento/`         | 8004  | Processamento de pagamento (mock)              |
| Assinatura          | `assinatura/`        | 8005  | Assinaturas                                    |
| Barramento          | `barramento/`        | 10000 | Barramento de eventos entre os serviços        |

Cada tabela pertence a um único microsserviço, que concentra todo o seu CRUD. Quando um serviço precisa de dados de outro, a comunicação passa pelo barramento de eventos.

## Barramento de Eventos — `http://localhost:10000`

Os serviços publicam eventos em `POST /eventos`, e o barramento repassa cada evento para o endpoint de eventos dos serviços:

| Destino      | Endpoint                                 |
| ------------ | ---------------------------------------- |
| Catálogo     | `http://localhost:8001/api/eventos`      |
| Autenticação | `http://localhost:8002/api/auth/eventos` |
| Carrinho     | `http://localhost:8003/api/eventos`      |

**Formato do evento**

```json
{ "tipo": "NomeDoEvento", "dados": "..." }
```

| Evento                | Publicado por | Tratado por  | Descrição                                       |
| --------------------- | ------------- | ------------ | ----------------------------------------------- |
| `GetPedidos`          | Carrinho      | Catálogo     | Pede nome/imagem das caixas dos pedidos         |
| `RespostaCaixa`       | Catálogo      | Carrinho     | Devolve as caixas (salvas em `caixas_cache`)    |
| `GetEndereco`         | Carrinho      | Autenticação | Pede o endereço salvo do usuário                |
| `RespostaGetEndereco` | Autenticação  | Carrinho     | Devolve o endereço do usuário                   |
| `SetEndereco`         | Carrinho      | Autenticação | Atualiza o endereço do usuário ao criar reserva |

## Configuração de Ambiente

Cada serviço carrega dois arquivos `.env` em ordem de prioridade:

1. **Próprio** (`<serviço>/.env`) — porta do serviço
2. **Raiz** (`backend/.env`) — vars compartilhadas (DB, JWT, SMTP, FRONT_URL)

### Estrutura dos `.env`

| Arquivo                  | Conteúdo                        |
| ------------------------ | ------------------------------- |
| `backend/.env`           | DB, JWT_SECRET, SMTP, FRONT_URL |
| `autenticacao/.env`      | `AUTH_PORT=8002`                |
| `listagem_produtos/.env` | `CATALOG_PORT=8001`             |
| `carrinho/.env`          | `RESERVA_PORT=8003`             |
| `pagamento/.env`         | `PAGAMENTO_PORT=8004`           |
| `assinatura/.env`        | `CANCELAMENTO_PORT=8005`        |

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

---

## Rotas da API

### Autenticação — `http://localhost:8002`

| Método | Rota                         | Auth | Descrição                                      |
| ------ | ---------------------------- | ---- | ---------------------------------------------- |
| `GET`  | `/api/auth/health`           | —    | Status do serviço                              |
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

### Carrinho/Pedidos — `http://localhost:8003`

Concentra todo o CRUD da tabela `pedidos` (criar, listar e cancelar).

| Método   | Rota                     | Auth | Descrição                                    |
| -------- | ------------------------ | ---- | -------------------------------------------- |
| `GET`    | `/api/health`            | —    | Status do serviço                            |
| `GET`    | `/api/reservas`          | JWT  | Lista pedidos do usuário logado              |
| `POST`   | `/api/reservas`          | JWT  | Cria reserva                                 |
| `DELETE` | `/api/reservas/:id`      | JWT  | Cancela (remove) um pedido do usuário logado |
| `GET`    | `/api/users/:id/address` | JWT  | Retorna endereço salvo do usuário            |

`DELETE /api/reservas/:id` retorna `404` se o pedido não existir ou não pertencer ao usuário.

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
    "estado": "pago",
    "id_caixa": 3,
    "nome_experiencia": "string",
    "imagem": "string"
  }
]
```

---

### Pagamento (mock) — `http://localhost:8004`

| Método | Rota             | Auth | Descrição                          |
| ------ | ---------------- | ---- | ---------------------------------- |
| `GET`  | `/api/health`    | —    | Status do serviço                  |
| `POST` | `/api/pagamento` | —    | Processa pagamento (sempre aprova) |

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

---

### Assinatura — `http://localhost:8005`

| Método | Rota          | Auth | Descrição         |
| ------ | ------------- | ---- | ----------------- |
| `GET`  | `/api/health` | —    | Status do serviço |

> O cancelamento de pedidos, que antes ficava aqui (`DELETE /api/cancelamento/:id`), foi movido para o serviço de Carrinho/Pedidos (`DELETE /api/reservas/:id`), para que o CRUD de `pedidos` fique inteiro em um único microsserviço.
