-- Roda automaticamente na primeira vez que o container do Postgres sobe (banco ru_custos
-- ja criado pela variavel POSTGRES_DB). Cria os schemas que cada microsservico usa; as
-- tabelas em si sao criadas pelo Hibernate (ddl-auto=update) na primeira vez que cada
-- servico conecta.
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS contratos;
CREATE SCHEMA IF NOT EXISTS pagamentos;
CREATE SCHEMA IF NOT EXISTS previsoes;
CREATE SCHEMA IF NOT EXISTS siop;
CREATE SCHEMA IF NOT EXISTS saldo;
