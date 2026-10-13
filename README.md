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

## Deploy no servidor (Oracle Cloud Always Free — sempre ligado, sem hibernar)

O plano gratuito do Render hiberna cada serviço depois de 15 minutos sem uso e limita a conta a 750
horas por mês. Com 7 serviços, o sistema demorava até minutos para responder. Na VM gratuita da
Oracle, tudo roda junto via `docker-compose.yml` + `docker-compose.prod.yml`: Postgres, 7 serviços
Java, nginx com o Angular e Caddy com HTTPS automático. Fica sempre no ar.

### 1. Criar a VM (no painel da Oracle Cloud, uma vez só)

1. Crie a conta em https://signup.cloud.oracle.com. Escolha a região **Brazil East (São Paulo)**. O
   cartão é só para verificação, e os recursos "Always Free" não são cobrados.
2. **Compute → Instances → Create instance**:
   - Image: **Canonical Ubuntu 24.04**
   - Shape: **Ampere → VM.Standard.A1.Flex**, com **4 OCPUs e 24 GB** de memória (tudo grátis)
   - Baixe a chave SSH privada (`.key`) que ele gera
3. Na página da instância, clique na **Subnet → Security List padrão → Add Ingress Rules** e libere
   as portas **80 e 443** (Source CIDR `0.0.0.0/0`, protocolo TCP).
4. Anote o **IP público** da instância.

> Se aparecer "Out of capacity" para o shape A1, tente de novo mais tarde ou em outro Availability
> Domain. É comum na Oracle.

### 2. Instalar o sistema (um comando)

No PowerShell do Windows:
```
ssh -i caminho\da\chave.key ubuntu@IP-PUBLICO
```
Já dentro da VM:
```
curl -fsSL https://raw.githubusercontent.com/waltercarvalhob/ru-custos/main/deploy/instalar-servidor.sh | bash
```
O script instala o Docker, libera o firewall interno da VM, baixa o código, gera o `.env` com senhas
aleatórias, oferece copiar os dados do Neon (pede a senha do banco que está no painel do Render) e
sobe tudo. No fim ele mostra o endereço, por exemplo `https://1-2-3-4.sslip.io`. O `sslip.io` dá um
nome com HTTPS sem precisar comprar domínio. Se tiver um domínio próprio, aponte-o para o IP e
informe-o quando o script perguntar.

### 3. Publicar novas versões

Depois de cada `git push`, rode na VM:
```
bash ~/ru-custos/deploy/atualizar.sh
```

Para recopiar os dados do Neon: `bash ~/ru-custos/deploy/migrar-dados-neon.sh`.

Comandos úteis (dentro de `~/ru-custos`):
```
alias dc='sudo docker compose -f docker-compose.yml -f docker-compose.prod.yml'
dc ps                 # status
dc logs -f gateway    # logs de um serviço
dc restart saldo-service
```

### Carga inicial da planilha no servidor (opcional)

Copie o `.xlsx` para `~/ru-custos` (`scp -i chave.key planilha.xlsx ubuntu@IP:~/ru-custos/`) e rode:
```
sudo docker run --rm --network ru-custos_default \
  -v "$(pwd)/tools:/tools" -v "$(pwd)":/dados \
  -e RU_CUSTOS_DB_DSN="host=postgres port=5432 dbname=ru_custos user=postgres password=$(grep ^DB_PASSWORD .env | cut -d= -f2)" \
  python:3.12-slim bash -c "pip install -q openpyxl psycopg2-binary && python /tools/import_excel.py /dados/NOME_DA_PLANILHA.xlsx"
```

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
