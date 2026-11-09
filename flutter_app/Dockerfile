# Flutter Web: compila com o SDK do Flutter e serve os arquivos com Nginx.
# Os endereços dos serviços entram no build via --dart-define (ver lib/config.dart).
# BASE_HREF: "/" para acesso direto (compose) ou "/flutter/" atrás do Ingress.
FROM ghcr.io/cirruslabs/flutter:stable AS build

WORKDIR /app

COPY pubspec.* ./
RUN flutter pub get

COPY . .

ARG BASE_HREF=/
ARG CATALOGO_URL=http://localhost:8001
ARG AUTH_URL=http://localhost:8002
ARG RESERVA_URL=http://localhost:8003
ARG PAGAMENTO_URL=http://localhost:8004
ARG CANCELAMENTO_URL=http://localhost:8005

RUN flutter build web --release \
    --base-href=${BASE_HREF} \
    --dart-define=CATALOGO_URL=${CATALOGO_URL} \
    --dart-define=AUTH_URL=${AUTH_URL} \
    --dart-define=RESERVA_URL=${RESERVA_URL} \
    --dart-define=PAGAMENTO_URL=${PAGAMENTO_URL} \
    --dart-define=CANCELAMENTO_URL=${CANCELAMENTO_URL}

FROM nginx:1.27-alpine

ARG BASE_HREF=/

COPY nginx.conf /etc/nginx/conf.d/default.conf
# Com BASE_HREF=/flutter/, os arquivos ficam em /usr/share/nginx/html/flutter/
COPY --from=build /app/build/web /usr/share/nginx/html${BASE_HREF}

EXPOSE 80
