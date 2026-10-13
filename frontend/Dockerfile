FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
# No Docker o nginx atende o app e faz proxy de /api para o gateway na mesma origem, entao todas
# as URLs sao relativas (substitui o environment.production.ts que aponta para o onrender.com).
RUN printf '%s\n' \
  'const apiBaseUrl = "/api";' \
  'export const environment = {' \
  '  production: true,' \
  '  apiBaseUrl,' \
  '  authBaseUrl: `${apiBaseUrl}/auth`,' \
  '  contratosBaseUrl: `${apiBaseUrl}/contratos`,' \
  '  pagamentosBaseUrl: `${apiBaseUrl}/pagamentos`,' \
  '  previsoesBaseUrl: `${apiBaseUrl}/previsoes`,' \
  '  siopBaseUrl: `${apiBaseUrl}/siop`,' \
  '  saldoBaseUrl: `${apiBaseUrl}/saldo`' \
  '};' > src/environments/environment.production.ts
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
