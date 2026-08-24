// ATENCAO: este arquivo e sobrescrito automaticamente pelo buildCommand do render.yaml antes do
// build de producao, preenchendo cada *BaseUrl com o endereco publico onrender.com real de cada
// servico (descoberto via fromService no blueprint). O conteudo abaixo e so um fallback para
// quando alguem roda "ng build --configuration production" localmente sem passar por esse passo.
export const environment = {
  production: true,
  apiBaseUrl: 'https://ru-custos-gateway.onrender.com/api',
  authBaseUrl: 'https://ru-custos-auth.onrender.com/api/auth',
  contratosBaseUrl: 'https://ru-custos-contratos.onrender.com/api/contratos',
  pagamentosBaseUrl: 'https://ru-custos-pagamentos.onrender.com/api/pagamentos',
  previsoesBaseUrl: 'https://ru-custos-previsoes.onrender.com/api/previsoes',
  siopBaseUrl: 'https://ru-custos-siop.onrender.com/api/siop',
  saldoBaseUrl: 'https://ru-custos-saldo.onrender.com/api/saldo'
};
