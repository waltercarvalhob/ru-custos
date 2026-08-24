// Usa o mesmo host que o navegador usou para abrir o app (localhost, IP da rede local, etc.)
// para chamar o gateway na mesma maquina, na porta 8080 - assim funciona tanto em
// localhost:4200 quanto acessando pelo IP da rede (ex: http://172.29.122.255:4200).
export const environment = {
  production: false,
  apiBaseUrl: `http://${window.location.hostname}:8080/api`
};
