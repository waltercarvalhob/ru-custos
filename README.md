# RU-CUSTOS — Análise de Custos do Restaurante Universitário (PROAES/UFMA)

Sistema para substituir a planilha `Saldo_Real_RU_*.xlsx`: controle de contratos, pagamentos,
previsões de execução e orçamento SIOP dos Restaurantes Universitários. Backend em microsserviços
Spring Boot (Java), frontend Angular, banco PostgreSQL.

## Estrutura

```
RU-CUSTOS/
  backend/
    gateway/            -> porta 8080, unico ponto de entrada para o frontend
    auth-service/        -> porta 8081, login/cadastro (schema auth)
    contratos-service/   -> porta 8082, campus/contratos/empenhos (schema contratos)
    pagamentos-service/  -> porta 8083, pagamentos mensais (schema pagamentos)
    previsoes-service/   -> porta 8084, execucao e previsao mensal (schema previsoes)
    siop-service/        -> porta 8085, orcamento SIOP (schema siop)
    saldo-service/        -> porta 8086, resumo executivo / dashboard (schema saldo)
  frontend/               -> Angular 18, porta 4200
  tools/
    import_excel.py       -> carga inicial dos dados da planilha no Postgres
```

## Pré-requisitos

- JDK 17+
- Maven (`mvn -v`)
- Node.js 18+ (o projeto foi criado com Node 22 / Angular CLI 18)
- PostgreSQL local, porta **5432**, usuário `postgres` (a senha já está configurada em cada `application.properties` e em `tools/import_excel.py` — ajuste nos dois lugares se você trocar a senha do Postgres)
- Python 3 com `openpyxl` e `psycopg2-binary` (só para rodar o importador uma vez)

## 1. Banco de dados

```sql
CREATE DATABASE ru_custos;
```

Os schemas (`auth`, `contratos`, `pagamentos`, `previsoes`, `siop`, `saldo`) e as tabelas são
criados automaticamente pelo Hibernate (`ddl-auto=update`) na primeira vez que cada serviço sobe —
não é preciso criar schema manualmente, o Postgres cria o schema sob demanda via
`?currentSchema=...` na URL de conexão de cada serviço.

## 2. Subir os serviços (ordem sugerida)

Cada serviço é um projeto Maven independente. Pelo terminal:

```
cd backend/auth-service        && mvn spring-boot:run
cd backend/contratos-service   && mvn spring-boot:run
cd backend/pagamentos-service  && mvn spring-boot:run
cd backend/previsoes-service   && mvn spring-boot:run
cd backend/siop-service        && mvn spring-boot:run
cd backend/saldo-service       && mvn spring-boot:run
cd backend/gateway             && mvn spring-boot:run
```

(pode rodar em qualquer ordem, mas o `saldo-service` só responde corretamente depois que
contratos/previsoes/siop estiverem no ar, e o `gateway` é o que o frontend efetivamente chama).

**Via Eclipse:** File → Import → Maven → Existing Maven Projects → selecione a pasta `backend`
inteira (o Eclipse detecta os 7 projetos automaticamente, cada um com seu próprio `pom.xml`).
Depois, botão direito em cada projeto → Run As → Spring Boot App.

Teste rápido depois que tudo estiver de pé: `http://localhost:8080/api/auth/login` (via gateway)
deve responder (405/400, não erro de conexão — já que é POST).

## 3. Carga inicial dos dados da planilha

Depois que **contratos-service, pagamentos-service, previsoes-service e siop-service** já
tiverem subido pelo menos uma vez (para as tabelas existirem):

```
cd tools
pip install openpyxl psycopg2-binary
python import_excel.py "caminho/para/Saldo_Real_RU_....xlsx"
```

## 4. Frontend (Angular)

```
cd frontend
npm install
npm start
```

Abre em `http://localhost:4200`. O app fala com o gateway usando o mesmo host que você usou para
abrir a página (configurado em `src/environments/environment.ts` via `window.location.hostname`) —
por isso funciona tanto em `localhost:4200` quanto pelo IP da rede, sem precisar trocar nada.

### Acesso de outros computadores/celulares na mesma rede (Wi-Fi/LAN)

1. Descubra o IP desta máquina na rede: `ipconfig` (Windows) → "Endereço IPv4" do adaptador de
   rede em uso (Wi-Fi ou Ethernet).
2. Suba o frontend escutando em todas as interfaces, não só localhost:
   ```
   npm start -- --host 0.0.0.0
   ```
   (o `package.json` já usa o builder novo do Angular, que detecta e mostra o endereço de rede,
   ex: `Network: http://172.29.122.255:4200/`).
3. Libere as portas 4200 e 8080 no Firewall do Windows — rode uma vez, como Administrador:
   ```
   powershell -ExecutionPolicy Bypass -File tools\liberar_firewall.ps1
   ```
4. Em outro computador/celular na mesma rede, acesse `http://<IP-desta-máquina>:4200`.

**Atenção**: se a rede Wi-Fi estiver marcada pelo Windows como "Pública" (comum em redes
institucionais/compartilhadas), qualquer outro dispositivo nessa mesma rede também consegue tentar
acessar o sistema nessas portas, não só computadores de confiança — o script de firewall libera nos
três perfis (Domain/Private/Public) por causa disso. Além disso, o segredo usado para assinar o
login (`ru-custos.jwt.secret` em cada `application.properties`) ainda é o valor padrão de
desenvolvimento — troque-o antes de expor isso a mais gente do que só você testando.

Fluxo: tela inicial (`/`) → botão "Consultar" → login (crie uma conta em "Cadastre-se") → shell
com menu lateral (SALDO / PAGAMENTO / PREVISÕES / CONTRATOS / SIOP).

## Deploy num servidor (acesso de qualquer lugar, via Docker)

Se a rede local tiver isolamento de cliente (comum em Wi-Fi institucional/pública — os aparelhos
não se enxergam entre si mesmo com o firewall liberado), a alternativa é hospedar o sistema inteiro
num servidor de verdade. Existe um `docker-compose.yml` na raiz do projeto que sobe tudo (Postgres +
7 serviços Java + frontend) com um único comando, pensado para uma VM gratuita (ex: Oracle Cloud
"Always Free").

### 0. Preparar a VM (Ubuntu na Oracle Cloud)

Instale o Docker (inclui o `docker compose`), conectado por SSH na VM:
```
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker $USER
```
Depois do `usermod`, saia (`exit`) e conecte de novo por SSH para o grupo `docker` valer (evita precisar
de `sudo` em todo comando docker).

Copie o projeto da sua máquina Windows para a VM (rode isto no **PowerShell do Windows**, não na VM —
troque `usuario` e `IP-DA-VM` pelos dados reais da sua instância):
```
scp -r C:\Walter\RU-CUSTOS usuario@IP-DA-VM:~/
```
(o Windows 10/11 já vem com cliente `scp`/`ssh` embutido; se pedir a chave `.pem` da Oracle Cloud, use
`scp -i caminho\da\chave.pem -r C:\Walter\RU-CUSTOS usuario@IP-DA-VM:~/`).

**Na VM** (depois de conectar por SSH, dentro da pasta `~/RU-CUSTOS`):

1. Confirme que o projeto chegou certinho: `ls` deve mostrar `docker-compose.yml`, `backend/`, `frontend/`, etc.
2. Crie o arquivo de segredos a partir do modelo:
   ```
   cp .env.example .env
   ```
   Edite `.env` e troque `DB_PASSWORD` e `JWT_SECRET` por valores reais (gere o `JWT_SECRET` com
   `openssl rand -base64 48`, por exemplo). **Nunca** commite o `.env` no git — ele já está no
   `.gitignore`.
3. Suba tudo:
   ```
   docker compose up -d --build
   ```
   A primeira vez demora alguns minutos (compila os 7 serviços Java + o frontend). Acompanhe com
   `docker compose logs -f`.
4. Carga inicial dos dados da planilha (rode uma vez, de dentro da VM, depois de copiar o `.xlsx`
   para lá): usa um container Python temporário na mesma rede Docker, sem precisar instalar nada
   na VM nem expor o Postgres publicamente:
   ```
   docker run --rm --network ru-custos_default \
     -v "$(pwd)/tools:/tools" -v "$(pwd)":/dados \
     -e RU_CUSTOS_DB_DSN="host=postgres port=5432 dbname=ru_custos user=postgres password=SUA_DB_PASSWORD_AQUI" \
     python:3.12-slim bash -c "pip install -q openpyxl psycopg2-binary && python /tools/import_excel.py /dados/NOME_DA_PLANILHA.xlsx"
   ```
   (troque `SUA_DB_PASSWORD_AQUI` pelo valor real de `DB_PASSWORD` do `.env`, e `NOME_DA_PLANILHA.xlsx`
   pelo nome do arquivo copiado para a VM; `ru-custos_default` é o nome da rede que o Docker Compose
   cria automaticamente a partir do nome da pasta — confirme com `docker network ls` se o nome vier
   diferente).
5. Libere a porta 80 (HTTP) no firewall da própria VM (`ufw allow 80/tcp` no Ubuntu) **e** na regra
   de rede da nuvem (na Oracle Cloud: "Security List" / "Network Security Group" da VCN — sem isso,
   a porta fica bloqueada mesmo com o firewall do Linux liberado).
6. Acesse `http://<IP-público-da-VM>` de qualquer lugar — o frontend (nginx) serve o Angular e
   repassa `/api/*` para o gateway internamente, então não existe problema de CORS em produção.

Comandos úteis: `docker compose ps` (status), `docker compose logs -f <serviço>` (logs),
`docker compose down` (para tudo, mantém os dados), `docker compose up -d --build` de novo depois
de alterar código (reconstrói só o que mudou).

## Segurança

Login emite um JWT (HMAC) no `auth-service`. Cada serviço valida esse token com o mesmo segredo
compartilhado (`ru-custos.jwt.secret` em cada `application.properties` — **troque esse valor
antes de qualquer uso fora da sua máquina**). O gateway também valida o token antes de rotear.

## Próximos passos (quando quiser expandir)

- Perfis de usuário (`ADMIN`/`GESTOR`/`VISUALIZADOR`) já existem no modelo, mas nenhuma tela/
  endpoint hoje restringe ação por perfil — é só autenticação, não autorização por papel.
- A metodologia de cálculo de previsão em `previsoes-service` é uma aproximação da lógica da
  planilha original; vale validar os números lado a lado com a planilha depois da carga inicial.
- Sem testes automatizados ainda.
