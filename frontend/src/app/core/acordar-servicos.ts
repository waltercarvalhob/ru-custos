import { environment } from '../../environments/environment';

/**
 * No plano gratuito do Render cada servico "dorme" apos 15 min sem uso e leva ate 1 min para
 * acordar. Assim que o site abre, mandamos uma requisicao simples a todos ao mesmo tempo, para que
 * eles ja estejam acordando enquanto a pessoa digita o login. Qualquer resposta (ate 401/404)
 * serve: o que importa e o servico receber a chamada. "no-cors" evita bloqueio de CORS e o
 * resultado e ignorado. So roda em producao (em dev tudo passa pelo gateway local).
 */
export function acordarServicos(): void {
  if (!environment.production) return;
  const urls = [
    environment.authBaseUrl,
    environment.contratosBaseUrl,
    environment.pagamentosBaseUrl,
    environment.previsoesBaseUrl,
    environment.siopBaseUrl,
    environment.saldoBaseUrl
  ];
  for (const url of urls) {
    fetch(url, { mode: 'no-cors', cache: 'no-store' }).catch(() => undefined);
  }
}
