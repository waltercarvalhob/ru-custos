#!/usr/bin/env bash
# Copia os dados do banco Neon (usado pelo Render) para o Postgres local do servidor.
# Pode ser rodado de novo a qualquer momento: SUBSTITUI os dados locais pelos do Neon.
# Uso (dentro de ~/ru-custos):  bash deploy/migrar-dados-neon.sh
set -euo pipefail
cd "$(dirname "$0")/.."

NEON_HOST="ep-quiet-poetry-axtj7mb9.c-4.us-east-2.aws.neon.tech"   # host direto (sem pooler) para o pg_dump
NEON_DB="neondb"
NEON_USER="neondb_owner"
SCHEMAS=(auth contratos pagamentos previsoes siop saldo)

compose() { sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml "$@"; }

read -r -s -p "Senha do Neon (a mesma do DB_PASSWORD no painel do Render): " NEON_PASSWORD </dev/tty
echo

dump="$(mktemp)"
trap 'rm -f "$dump"' EXIT

echo "==> Exportando do Neon"
schema_args=()
for s in "${SCHEMAS[@]}"; do schema_args+=(-n "$s"); done
# Cliente 17 porque o pg_dump precisa ser da mesma versao do servidor do Neon ou mais nova.
sudo docker run --rm -e PGPASSWORD="$NEON_PASSWORD" postgres:17-alpine \
  pg_dump "host=$NEON_HOST dbname=$NEON_DB user=$NEON_USER sslmode=require" \
  --no-owner --no-privileges "${schema_args[@]}" > "$dump"
echo "    $(wc -c < "$dump") bytes exportados"

echo "==> Parando os servicos e limpando o banco local"
compose stop auth-service contratos-service pagamentos-service previsoes-service siop-service saldo-service gateway 2>/dev/null || true
compose up -d --wait postgres
for s in "${SCHEMAS[@]}"; do
  compose exec -T postgres psql -q -U postgres -d ru_custos -c "DROP SCHEMA IF EXISTS $s CASCADE;"
done

echo "==> Importando"
# Avisos como 'unrecognized configuration parameter "transaction_timeout"' sao normais
# (o dump vem de um Postgres mais novo) e nao afetam os dados.
compose exec -T postgres psql -q -U postgres -d ru_custos < "$dump"

echo "==> Dados copiados. Suba o resto com:"
echo "    sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d"
