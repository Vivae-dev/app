# Vivae - Frontend (React + Vite)

UI glassmorphism conectada aos microsserviços do backend.

## Configuração

Copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

Variáveis disponíveis:

```env
VITE_CATALOGO_URI=http://localhost:8001
VITE_AUTH_URI=http://localhost:8002
VITE_RESERVA_URI=http://localhost:8003
VITE_PAGAMENTO_URI=http://localhost:8004
```

## Como Rodar

```bash
npm install
npm run dev
```

Disponível em [http://localhost:8000](http://localhost:8000)

## Build de Produção

```bash
npm run build
```

## Fluxo de Compra

1. Catálogo → selecionar caixa
2. Checkout — endereço de entrega
3. Confirmação do pedido
4. Pagamento com cartão (mock)
5. Reserva criada → toast de confirmação

## Acompanhamento de Pedidos

Usuários logados acessam "Meus Pedidos" no menu para ver histórico com status em tempo real.
