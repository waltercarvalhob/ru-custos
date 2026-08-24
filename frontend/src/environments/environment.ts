// Usa o mesmo host que o navegador usou para abrir o app (localhost, IP da rede local, etc.)
// para chamar o gateway na mesma maquina, na porta 8080 - assim funciona tanto em
// localhost:4200 quanto acessando pelo IP da rede (ex: http://172.29.122.255:4200).
// Em dev/LAN/Docker o gateway funciona normalmente, entao todo mundo passa por ele -
// os campos *BaseUrl abaixo existem so para ter o mesmo formato do environment.production.ts.
const apiBaseUrl = `http://${window.location.hostname}:8080/api`;

export const environment = {
  production: false,
  apiBaseUrl,
  authBaseUrl: `${apiBaseUrl}/auth`,
  contratosBaseUrl: `${apiBaseUrl}/contratos`,
  pagamentosBaseUrl: `${apiBaseUrl}/pagamentos`,
  previsoesBaseUrl: `${apiBaseUrl}/previsoes`,
  siopBaseUrl: `${apiBaseUrl}/siop`,
  saldoBaseUrl: `${apiBaseUrl}/saldo`
};
