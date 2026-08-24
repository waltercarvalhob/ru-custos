// Em producao, o nginx que serve o frontend tambem faz proxy reverso de /api/* para o gateway
// (mesma origem, sem CORS). Ver docker/frontend/nginx.conf.
export const environment = {
  production: true,
  apiBaseUrl: '/api'
};
