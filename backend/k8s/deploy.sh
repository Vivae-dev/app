#!/usr/bin/env bash
# Constrói as imagens e implanta tudo no cluster local (Minikube, kind ou Docker Desktop).
# Uso: cd backend && bash k8s/deploy.sh
#
# Pré-requisitos: docker, kubectl e um cluster local ativo (kubectl config current-context).
# Acesso depois do deploy: http://localhost (React) e http://localhost/flutter/ (Flutter Web).
set -euo pipefail

export MSYS_NO_PATHCONV=1 

cd "$(dirname "$0")/.."   # pasta backend/

if [ ! -f .env ]; then
  echo "Falta o arquivo backend/.env (copie de .env.example e preencha as credenciais)." >&2
  exit 1
fi

# Endereço público do Ingress; o navegador chama a API pela mesma origem.
API=http://localhost

echo "==> Construindo imagens dos microsserviços"
docker compose build

echo "==> Construindo React e Flutter Web (apontando para o Ingress)"
docker build -t vivae-frontend:k8s \
  --build-arg VITE_CATALOGO_URI=$API \
  --build-arg VITE_AUTH_URI=$API \
  --build-arg VITE_RESERVA_URI=$API \
  --build-arg VITE_PAGAMENTO_URI=$API \
  --build-arg VITE_CANCELAMENTO_URI=$API \
  ../frontend
docker build -t vivae-flutter:k8s \
  --build-arg BASE_HREF=/flutter/ \
  --build-arg CATALOGO_URL=$API \
  --build-arg AUTH_URL=$API \
  --build-arg RESERVA_URL=$API \
  --build-arg PAGAMENTO_URL=$API \
  --build-arg CANCELAMENTO_URL=$API \
  ../flutter_app

IMAGES="backend-catalogo backend-auth backend-carrinho backend-pagamento backend-assinatura backend-barramento vivae-frontend:k8s vivae-flutter:k8s"

# Minikube e kind têm repositório de imagens próprio; o Docker Desktop usa o mesmo do docker.
case "$(kubectl config current-context)" in
  minikube)
    echo "==> Carregando imagens no Minikube"
    for img in $IMAGES; do minikube image load "$img"; done ;;
  kind-*)
    echo "==> Carregando imagens no kind"
    for img in $IMAGES; do kind load docker-image "$img"; done ;;
esac

echo "==> Aplicando Secret (a partir de backend/.env) e manifestos"
kubectl create secret generic backend-env --from-env-file=.env --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f k8s/catalogo.yaml -f k8s/auth.yaml -f k8s/carrinho.yaml \
  -f k8s/pagamento.yaml -f k8s/assinatura.yaml -f k8s/barramento.yaml \
  -f k8s/frontend.yaml -f k8s/flutter.yaml -f k8s/ingress.yaml

echo
echo "Pronto. Acompanhe com: kubectl get pods"
echo "React:       http://localhost"
echo "Flutter Web: http://localhost/flutter/"
