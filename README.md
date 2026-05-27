# Grupo

22.01341-5: Eduardo Dislich dos Santos  
23.00035-0: Eduardo Martelli Marzagão  
22.10019-9: Helena Romeu Gallas  
23.00099-6: Leandro Meneghetti Fabre  
23.00937-3: Lívia Naomi Ueno  
22.01027-0: Rodrigo Yassuhide Higa

# Vivae

Serviço que vende experiências em caixas de assinatura e avulsas.

Arquitetura: backend Express (TypeScript) em microsserviços + frontend React (Vite).

## Como Rodar

### Backend

```bash
cd backend
npm run setup   # copia .env.examples + instala deps de cada serviço (só na primeira vez)
# edite backend/.env com suas credenciais
npm run dev     # sobe todos os microsserviços simultaneamente
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Disponível em [http://localhost:8000](http://localhost:8000)

---

## Portas dos Microsserviços

| Serviço              | Porta |
| -------------------- | ----- |
| Frontend             | 8000  |
| Catálogo de Produtos | 8001  |
| Autenticação         | 8002  |
| Carrinho/Reservas    | 8003  |
| Pagamento (mock)     | 8004  |

---

## Configuração de E-mail (SMTP)

Para desenvolvimento, use o [Ethereal Email](https://ethereal.email) (fake SMTP, zero configuração):

```bash
node backend/scripts/setup-ethereal.js
```

O script cria uma conta de teste e imprime as variáveis SMTP para colar em `backend/.env`.

Para produção, preencha manualmente:

```env
SMTP_HOST=smtp.seuservidor.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu@email.com
SMTP_PASS=sua_senha
SMTP_FROM=noreply@vivae.com
AUTH_BASE_URL=http://localhost:8002
```

---

## TODOs Pendentes

- [x] `carrinho/reserva.ts` — persistir reservas no banco (tabela `pedidos`)
- [x] `carrinho/reserva.ts` — implementar `GET /api/reservas` (listar pedidos do usuário)
- [x] `carrinho/reserva.ts` — implementar `GET /api/users/:id/address`
- [x] `App.tsx` — acompanhamento de pedidos (view "Meus Pedidos")
- [x] `App.tsx` — fluxo de pagamento mock (checkout-payment)
- [ ] `authController.ts` — adicionar coluna `token_expiry` e checar expiração do token de confirmação
- [ ] `authController.ts` — endpoint `POST /api/auth/reenviar-confirmacao`
- [ ] `App.tsx` — fluxo pós-cadastro: mostrar "verifique seu e-mail" em vez de tentar logar
- [ ] `App.tsx` — página `/confirmar/:token` para ativar conta pelo link do e-mail
- [ ] `App.tsx` — quebrar em componentes (AuthModal, ProductCard, CheckoutFlow, AdminPanel)
