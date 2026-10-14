#!/usr/bin/env bash
# Cria a VM gratuita (Always Free, Ampere A1) do RU-CUSTOS na Oracle Cloud, sem formulario.
# Rode no Cloud Shell do painel da Oracle (icone ">_" no topo da pagina):
#
#   curl -fsSL https://raw.githubusercontent.com/waltercarvalhob/ru-custos/main/deploy/oracle-criar-vm.sh | bash
#
# O que faz:
#   1. Apaga as VMs pagas criadas por engano (shapes VM.Standard3.Flex e VM.Standard.A2.Flex).
#   2. Usa a sub-rede publica que ja existe (ou cria rede + sub-rede publica se nao houver).
#   3. Libera as portas 80 e 443 na Security List dessa sub-rede.
#   4. Cria a VM "ru-custos" VM.Standard.A1.Flex com Ubuntu 24.04 e IP publico. Se faltar
#      capacidade, tenta tamanhos menores e fica tentando de novo a cada minuto.
set -euo pipefail

SSH_PUBLIC_KEY="${SSH_PUBLIC_KEY:-ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDfQ13xDaVQbAt6DGH2Nw+WgpEFJvY3ullnWjgklUNir2f5Sqrdrj35QGdoF5XFovefJlHjCskUkZce1xvQdc87UcDysU6kQVVh+/BShQTxi9/q3Idug7cKIyuSEDQjFprvxA5HpgsmXkUFUZ8GL/T1en5ZgUyDzUJ0mBJTD72/4TxJCp1dWRGX+dQHhYFYXlV55SxAV21cbAEt/KzkmNTOqrkFv7qrC0b5Yk+trCs2SS7rDug/SRXvb9OIwvjg/nTJr3TXc9rk4nGOgQkZL8phESv511NPRNRC/XOBqjrZQKGTzZXG/yNAogDGNwstGKIqWM8c1WRJ2TsAzOlwGy4t ssh-key-2026-10-14}"
SHAPE="VM.Standard.A1.Flex"
NOME="ru-custos"
TAMANHOS=("4 24" "2 12" "1 6")   # OCPUs e GB de memoria, do maior para o menor

T="${OCI_TENANCY:?Rode este script no Cloud Shell da Oracle}"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT

echo "==> Conta: $T"
AD="$(oci iam availability-domain list -c "$T" --query 'data[0].name' --raw-output)"
echo "    Availability domain: $AD"

echo "==> Procurando VMs existentes"
oci compute instance list -c "$T" --all \
  --query 'data[?"lifecycle-state"!=`TERMINATED` && "lifecycle-state"!=`TERMINATING`].{id:id,nome:"display-name",shape:shape,estado:"lifecycle-state"}' \
  --output json > "$tmp/vms.json"
jq -r '.[]? | "    \(.nome)  \(.shape)  \(.estado)"' "$tmp/vms.json"

for id in $(jq -r '.[]? | select(.shape=="VM.Standard3.Flex" or .shape=="VM.Standard.A2.Flex") | .id' "$tmp/vms.json"); do
  echo "==> Apagando VM paga: $id"
  oci compute instance terminate --instance-id "$id" --preserve-boot-volume false --force
done

INST="$(jq -r --arg s "$SHAPE" '[.[]? | select(.shape==$s)][0].id // empty' "$tmp/vms.json")"

if [ -z "$INST" ]; then
  echo "==> Procurando sub-rede publica"
  SUBNET="$(oci network subnet list -c "$T" --all \
    --query 'data[?"prohibit-public-ip-on-vnic"==`false` && "lifecycle-state"==`AVAILABLE`].id | [0]' --raw-output)"
  if [ -z "$SUBNET" ] || [ "$SUBNET" = "null" ]; then
    echo "    Nenhuma encontrada - criando rede ru-custos-vcn com sub-rede publica"
    VCN="$(oci network vcn create -c "$T" --cidr-block 10.0.0.0/16 --display-name ru-custos-vcn --dns-label rucustos \
      --wait-for-state AVAILABLE --query 'data.id' --raw-output)"
    IGW="$(oci network internet-gateway create -c "$T" --vcn-id "$VCN" --is-enabled true --display-name ru-custos-igw \
      --wait-for-state AVAILABLE --query 'data.id' --raw-output)"
    RT="$(oci network vcn get --vcn-id "$VCN" --query 'data."default-route-table-id"' --raw-output)"
    oci network route-table update --rt-id "$RT" --force \
      --route-rules "[{\"destination\":\"0.0.0.0/0\",\"destinationType\":\"CIDR_BLOCK\",\"networkEntityId\":\"$IGW\"}]" >/dev/null
    SUBNET="$(oci network subnet create -c "$T" --vcn-id "$VCN" --cidr-block 10.0.0.0/24 --display-name ru-custos-publica \
      --dns-label publica --prohibit-public-ip-on-vnic false --wait-for-state AVAILABLE --query 'data.id' --raw-output)"
  fi
  echo "    Sub-rede: $SUBNET"

  echo "==> Liberando portas 80 e 443"
  SL="$(oci network subnet get --subnet-id "$SUBNET" --query 'data."security-list-ids"[0]' --raw-output)"
  oci network security-list get --security-list-id "$SL" --query 'data."ingress-security-rules"' --output json > "$tmp/regras.json"
  for porta in 80 443; do
    if ! jq -e --argjson p "$porta" 'any(.[]; .protocol=="6" and .source=="0.0.0.0/0" and ."tcp-options"."destination-port-range".min==$p)' "$tmp/regras.json" >/dev/null; then
      jq --argjson p "$porta" '. + [{"protocol":"6","source":"0.0.0.0/0","sourceType":"CIDR_BLOCK","isStateless":false,"tcpOptions":{"destinationPortRange":{"min":$p,"max":$p}}}]' \
        "$tmp/regras.json" > "$tmp/r2.json" && mv "$tmp/r2.json" "$tmp/regras.json"
    fi
  done
  # O get devolve chaves com hifen; o update aceita as duas formas, mas normalizamos para camelCase.
  jq '[.[] | {protocol, source, sourceType:(.sourceType // ."source-type"), isStateless:(.isStateless // ."is-stateless" // false)}
       + (if (.tcpOptions // ."tcp-options") then {tcpOptions:{destinationPortRange:{min:((.tcpOptions // ."tcp-options") | (.destinationPortRange // ."destination-port-range").min), max:((.tcpOptions // ."tcp-options") | (.destinationPortRange // ."destination-port-range").max)}}} else {} end)
       + (if (.icmpOptions // ."icmp-options") then {icmpOptions:((.icmpOptions // ."icmp-options") | with_entries(select(.value != null)))} else {} end)]' \
    "$tmp/regras.json" > "$tmp/regras-final.json"
  oci network security-list update --security-list-id "$SL" --ingress-security-rules "file://$tmp/regras-final.json" --force >/dev/null
  echo "    OK"

  echo "==> Procurando imagem Ubuntu 24.04 (ARM)"
  IMG="$(oci compute image list -c "$T" --operating-system "Canonical Ubuntu" --operating-system-version "24.04" \
    --shape "$SHAPE" --sort-by TIMECREATED --sort-order DESC --query 'data[0].id' --raw-output)"
  echo "    Imagem: $IMG"
  printf '%s\n' "$SSH_PUBLIC_KEY" > "$tmp/chave.pub"

  tentativa=0
  while [ -z "$INST" ]; do
    tentativa=$((tentativa + 1))
    for t in "${TAMANHOS[@]}"; do
      set -- $t
      echo "==> Tentativa $tentativa: criando $SHAPE com $1 OCPU e $2 GB"
      if INST="$(oci compute instance launch -c "$T" --availability-domain "$AD" --display-name "$NOME" \
          --shape "$SHAPE" --shape-config "{\"ocpus\":$1,\"memoryInGBs\":$2}" --image-id "$IMG" \
          --subnet-id "$SUBNET" --assign-public-ip true --ssh-authorized-keys-file "$tmp/chave.pub" \
          --query 'data.id' --raw-output 2>"$tmp/erro.txt")"; then
        break
      fi
      INST=""
      grep -qi "capacity" "$tmp/erro.txt" && echo "    Sem capacidade neste tamanho." || { cat "$tmp/erro.txt"; exit 1; }
    done
    if [ -z "$INST" ]; then
      echo "    A Oracle esta sem capacidade de A1 agora. Tentando de novo em 60 s (Ctrl+C para parar)..."
      sleep 60
    fi
  done
fi

echo "==> Aguardando a VM ligar"
oci compute instance get --instance-id "$INST" --wait-for-state RUNNING --max-wait-seconds 900 >/dev/null
IP="$(oci compute instance list-vnics --instance-id "$INST" --query 'data[0]."public-ip"' --raw-output)"
CFG="$(oci compute instance get --instance-id "$INST" --query 'data."shape-config".{ocpus:ocpus,gb:"memory-in-gbs"}' --output json | jq -c .)"
echo
echo "PRONTO! VM ru-custos ($SHAPE $CFG) ligada."
echo "IP PUBLICO: $IP"
