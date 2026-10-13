#!/usr/bin/env bash
# Publica no servidor a versao mais recente do GitHub (rode depois de cada git push).
# Uso (na VM):  bash ~/ru-custos/deploy/atualizar.sh
set -euo pipefail
cd "$(dirname "$0")/.."
git pull --ff-only
sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
sudo docker image prune -f
