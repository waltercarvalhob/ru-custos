import { MonoTypeOperatorFunction, retry, timer } from 'rxjs';

/**
 * Servicos do Render (plano gratuito) hibernam apos periodos sem uso e podem levar dezenas de
 * segundos para acordar no primeiro acesso - nesse intervalo respondem com erro (502/503) em vez
 * de so demorar. Repete a chamada por ate ~1 minuto para dar tempo de acordar antes de desistir.
 *
 * Usar apenas em leituras (GET) - nunca em criar/atualizar/excluir, para nao arriscar repetir uma
 * gravacao que na verdade ja tinha sido aplicada no servidor antes do erro.
 */
const TENTATIVAS_AQUECIMENTO = 6;
const INTERVALO_AQUECIMENTO_MS = 10000;

export function retryAoAcordar<T>(): MonoTypeOperatorFunction<T> {
  return retry({ count: TENTATIVAS_AQUECIMENTO, delay: () => timer(INTERVALO_AQUECIMENTO_MS) });
}
