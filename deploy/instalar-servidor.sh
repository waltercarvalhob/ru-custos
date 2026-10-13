#!/usr/bin/env bash
# Instala o RU-CUSTOS numa VM Ubuntu nova (Oracle Cloud Always Free, shape Ampere A1).
# Rode uma unica vez, logado por SSH na VM:
#
#   curl -fsSL https://raw.githubusercontent.com/waltercarvalhob/ru-custos/main/deploy/instalar-servidor.sh | bash
#
# O que faz: instala Docker e git, libera as portas 80/443 no firewall interno da VM, baixa o
# repositorio em ~/ru-custos, gera o .env com senhas aleatorias, copia os dados do Neon (opcional)
# e sobe tudo com HTTPS. No fim mostra o endereco do sistema.
set -euo pipefail

REPO_URL="https://github.com/waltercarvalhob/ru-custos.git"
APP_DIR="$HOME/ru-custos"

echo "==> Instalando pacotes"
sudo apt-get update -y
sudo apt-get install -y git curl ca-certificates iptables-persistent
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sudo sh
fi
sudo usermod -aG docker "$USER"

echo "==> Liberando portas 80 e 443 no firewall da VM"
# As imagens Ubuntu da Oracle vem com iptables bloqueando tudo menos SSH (porta 22).
for porta in 80 443; do
  if ! sudo iptables -C INPUT -p tcp --dport "$porta" -j ACCEPT 2>/dev/null; then
    sudo iptables -I INPUT 1 -p tcp --dport "$porta" -j ACCEPT
  fi
done
sudo netfilter-persistent save

echo "==> Baixando o codigo"
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" pull --ff-only
else
  git clone "$REPO_URL" "$APP_DIR"
fi
cd "$APP_DIR"

if [ ! -f .env ]; then
  echo "==> Gerando .env"
  ip_publico="$(curl -fsS https://ifconfig.me)"
  # sslip.io resolve "1-2-3-4.sslip.io" para o IP 1.2.3.4 - da um nome com HTTPS sem comprar dominio.
  dominio_padrao="${ip_publico//./-}.sslip.io"
  read -r -p "Dominio do sistema [$dominio_padrao]: " dominio </dev/tty || true
  cat > .env <<EOF
DOMAIN=${dominio:-$dominio_padrao}
DB_PASSWORD=$(openssl rand -hex 24)
JWT_SECRET=$(openssl rand -base64 48 | tr -d '\n')
EOF
  chmod 600 .env
fi

compose() { sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml "$@"; }

echo "==> Construindo as imagens (a primeira vez demora uns 10-15 minutos)"
compose build

read -r -p "Copiar os dados atuais do Neon para o servidor? [S/n] " migrar </dev/tty || true
if [[ ! "${migrar:-S}" =~ ^[nN] ]]; then
  bash deploy/migrar-dados-neon.sh
fi

echo "==> Subindo o sistema"
compose up -d

dominio_final="$(grep '^DOMAIN=' .env | cut -d= -f2)"
echo
echo "Pronto! Acesse: https://$dominio_final"
echo "(os servicos Java levam ~1 minuto para terminar de iniciar na primeira vez)"
