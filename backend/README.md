# Vivae - Backend (Monorepo de Microsserviços)

Microsserviços Express + TypeScript sob Domain-Driven Design, mais o serviço de cancelamento (`assinatura/`) em Dart + shelf.

## Estrutura de Microsserviços

| Serviço       | Diretório           | Porta |
| ------------- | ------------------- | ----- |
| Autenticação  | `autenticacao/`     | 8002  |
| Catálogo      | `listagem_produtos/`| 8001  |
| Carrinho      | `carrinho/`         | 8003  |
| Pagamento     | `pagamento/`        | 8004  |
| Cancelamento (Dart) | `assinatura/` | 8005  |
| Barramento    | `barramento/`       | 10000 |

## Configuração de Ambiente

Cada serviço carrega dois arquivos `.env` em ordem de prioridade:

1. **Próprio** (`<serviço>/.env`) — porta do serviço
2. **Raiz** (`backend/.env`) — vars compartilhadas (DB, JWT, SMTP, FRONT_URL)

### Estrutura dos `.env`

| Arquivo                       | Conteúdo                          |
| ----------------------------- | --------------------------------- |
| `backend/.env`                | DB, JWT_SECRET, SMTP, FRONT_URL (origens liberadas no CORS, separadas por vírgula: React 8000 e Flutter 8100) |
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

Cada microsserviço tem seu próprio `Dockerfile`, e o React (`../frontend`) e o Flutter Web (`../flutter_app`) também. O `docker-compose.yml` sobe tudo:

```bash
cd backend
docker compose up --build
```

| Serviço | Endereço |
| ------- | -------- |
| React | http://localhost:8000 |
| Flutter Web | http://localhost:8100 |
| Catálogo, Auth, Carrinho, Pagamento, Cancelamento | http://localhost:8001 a 8005 |
| Barramento | http://localhost:10000 |

Os serviços leem as credenciais de `backend/.env` (`env_file`). Como cada um usa um banco diferente, o `DB_NAME` é definido por serviço no compose (`carrinho` e `assinatura` usam `carrinho`; `catalogo` usa `listagem_produtos`; os demais usam o do `.env`). Dentro do compose os serviços se enxergam pelo nome (`http://barramento:10000`, `http://catalogo:8001`...), por isso o endereço do barramento é lido da variável `BARRAMENTO_URL`, e não de `localhost`.

```bash
docker compose down   # para e remove os contêineres
```

## Kubernetes

Manifestos em `k8s/`: um Deployment + Service por microsserviço, mais `frontend.yaml`, `flutter.yaml` e o `ingress.yaml`, que expõe tudo em **http://localhost** (React em `/`, Flutter Web em `/flutter/`, e a API em `/api/...`). Como interface e API ficam na mesma origem, não há CORS.

| Caminho no Ingress | Serviço |
| ------------------ | ------- |
| `/api/auth` | auth (8002) |
| `/api/caixas` | catalogo (8001) |
| `/api/reservas`, `/api/users` | carrinho (8003) |
| `/api/pagamento` | pagamento (8004) |
| `/api/cancelamento` | assinatura (8005) |
| `/flutter` | Flutter Web |
| `/` | React |

Pré-requisitos: `docker`, `kubectl` e um cluster local ativo (Minikube, kind ou Docker Desktop com Kubernetes), com um Ingress Controller NGINX (veja o cabeçalho de `k8s/ingress.yaml`).

```bash
cd backend
cp .env.example .env     # preencha DB_*, JWT_SECRET e SMTP (só na primeira vez)
bash k8s/deploy.sh
```

O script constrói as imagens, carrega no Minikube/kind (se for o caso), cria o Secret `backend-env` a partir do `backend/.env` e aplica os manifestos. Depois: `kubectl get pods`.

O `DB_NAME` por serviço e o `BARRAMENTO_URL` estão no `env` de cada Deployment, que tem prioridade sobre o Secret.

Para remover tudo:

```bash
kubectl delete -f k8s/ --ignore-not-found   # inclui o Secret backend-env
```

As imagens usam `imagePullPolicy: IfNotPresent` (sem registry). Para publicar em um registry de nuvem, é preciso renomear as imagens com o endereço do registry e dar `docker push`.

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

---

### Cancelamento (Dart) — `http://localhost:8005`

Serviço em Dart (`shelf` + `shelf_router`, `postgres`, `dart_jsonwebtoken`). Valida o JWT, confere no banco se o pedido é do usuário e publica o evento `CancelarPedido` (`dados: [id_pedido, id_usuario]`) no barramento. Quem apaga o pedido é o `carrinho`, ao receber o evento.

| Método   | Rota                    | Auth | Descrição                    |
| -------- | ----------------------- | ---- | ---------------------------- |
| `DELETE` | `/api/cancelamento/:id` | JWT  | Cancela um pedido do usuário |

Respostas: `200` cancelado, `400` id inválido, `401` sem token/token inválido, `404` pedido não existe ou é de outro usuário, `500` erro no banco/barramento.

```bash
cd assinatura
dart pub get
dart run bin/assinatura.dart   # ou: npm run dev na pasta backend
dart test
```

Variáveis: `CANCELAMENTO_PORT` (padrão 8005), `BARRAMENTO_URL` (padrão `http://localhost:10000`), mais `DB_*`, `JWT_SECRET` e `FRONT_URL` do `backend/.env`.
