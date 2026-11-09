# React (Vite): compila e serve os arquivos estáticos com Nginx.
# O Vite grava os endereços dos serviços no build, então eles são ARGs.
# Os padrões batem com as portas publicadas pelo docker compose.
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_CATALOGO_URI=http://localhost:8001
ARG VITE_AUTH_URI=http://localhost:8002
ARG VITE_RESERVA_URI=http://localhost:8003
ARG VITE_PAGAMENTO_URI=http://localhost:8004
ARG VITE_CANCELAMENTO_URI=http://localhost:8005
ENV VITE_CATALOGO_URI=$VITE_CATALOGO_URI \
    VITE_AUTH_URI=$VITE_AUTH_URI \
    VITE_RESERVA_URI=$VITE_RESERVA_URI \
    VITE_PAGAMENTO_URI=$VITE_PAGAMENTO_URI \
    VITE_CANCELAMENTO_URI=$VITE_CANCELAMENTO_URI

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
