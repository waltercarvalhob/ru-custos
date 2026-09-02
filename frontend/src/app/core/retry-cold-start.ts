import { HttpErrorResponse } from '@angular/common/http';
import { MonoTypeOperatorFunction, retry, throwError, timer } from 'rxjs';

/**
 * Servicos do Render (plano gratuito) hibernam apos periodos sem uso e podem levar dezenas de
 * segundos para acordar no primeiro acesso - nesse intervalo o navegador nao consegue conectar
 * (status 0) ou o proxy do Render responde 502/503/504 enquanto o servico ainda esta subindo, em
 * vez de so demorar. Repete a chamada por ate ~1min20s para dar tempo de acordar antes de desistir.
 *
 * So repete quando o erro parece ser de servico dormindo (status 0/502/503/504) - qualquer outro
 * erro (401 senha invalida, 404, 409 email duplicado etc.) desiste na hora, sem esperar a toa.
 *
 * Seguro em leituras (GET) e no login (que so autentica de novo, sem efeito colateral). Nao usar em
 * criar/atualizar/excluir, para nao arriscar repetir uma gravacao que ja tinha sido aplicada no
 * servidor antes do erro aparecer no navegador.
 */
const TENTATIVAS_AQUECIMENTO = 8;
const INTERVALO_AQUECIMENTO_MS = 10000;

function pareceServicoDormindo(erro: unknown): boolean {
  if (!(erro instanceof HttpErrorResponse)) {
    return false;
  }
  return erro.status === 0 || erro.status === 502 || erro.status === 503 || erro.status === 504;
}

export function retryAoAcordar<T>(): MonoTypeOperatorFunction<T> {
  return retry({
    count: TENTATIVAS_AQUECIMENTO,
    delay: (erro) => (pareceServicoDormindo(erro) ? timer(INTERVALO_AQUECIMENTO_MS) : throwError(() => erro))
  });
}
