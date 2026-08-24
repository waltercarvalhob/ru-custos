import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SaldoResumo {
  valorTotalContratos: number;
  valorTotalUtilizado: number;
  executadoAcumulado: number;
  previsaoRestante: number;
  totalPrevistoAteFim: number;
  saldoContrato: number;
  totalEmpenhado: number;
  saldoEmpenho: number;
  reforcoEmpenhoNecessario: number;
  sobraEmpenho: number;
  reforcoLiquido: number;
  dotacaoAtualCusteio: number;
  empenhadoCusteio: number;
  saldoAUtilizarCusteio: number;
  valorDisponivelRemanejamento: number;
}

interface ContratosResumoDto {
  valorTotalContratos: number;
  valorTotalUtilizado: number;
  saldoContratos: number;
}

interface PrevisoesResumoDto {
  totalEmpenhado: number;
  executadoAcumulado: number;
  previsaoRestante: number;
  totalPrevistoAteFim: number;
  saldoEmpenhoPrevisto: number;
  reforcoEmpenhoNecessario: number;
  sobraEmpenho: number;
  sobraAproveitavel: number;
}

interface SiopResumoDto {
  dotacaoAtualCusteio: number;
  empenhadoCusteio: number;
  saldoAUtilizarCusteio: number;
}

export type CategoriaRemanejamento =
  | 'BOLSAS_AUXILIOS'
  | 'APOIO_ACADEMICO'
  | 'TRANSPORTE_INTERMUNICIPAL'
  | 'TRANSPORTE_INTRAMUNICIPAL'
  | 'MORADIA_PECUNIARIA';

export interface RemanejamentoSugestao {
  id?: number;
  categoria: CategoriaRemanejamento;
  valorSugerido: number;
  observacao?: string;
  mesReferencia?: string;
}

const BASE = environment.saldoBaseUrl;

@Injectable({ providedIn: 'root' })
export class SaldoService {
  constructor(private http: HttpClient) {}

  /**
   * Monta o resumo no proprio navegador, combinando os resumos individuais de
   * contratos/previsoes/siop (cada um chamado direto, sem passar por outro servico) em vez de
   * pedir para o saldo-service compor isso no backend - evita chamada servico-a-servico entre
   * dois serviços do Render, que na pratica se mostrou instavel no plano gratuito.
   */
  resumo(): Observable<SaldoResumo> {
    return forkJoin({
      contratos: this.http.get<ContratosResumoDto>(`${environment.contratosBaseUrl}/resumo`),
      previsoes: this.http.get<PrevisoesResumoDto>(`${environment.previsoesBaseUrl}/resumo`),
      siop: this.http.get<SiopResumoDto>(`${environment.siopBaseUrl}/resumo`)
    }).pipe(
      map(({ contratos, previsoes, siop }) => {
        const saldoContrato = contratos.valorTotalContratos - previsoes.totalPrevistoAteFim;
        const saldoEmpenho = previsoes.totalEmpenhado - previsoes.totalPrevistoAteFim;
        const reforcoLiquido = Math.max(0, previsoes.reforcoEmpenhoNecessario - previsoes.sobraAproveitavel);
        const valorDisponivelRemanejamento = siop.saldoAUtilizarCusteio - reforcoLiquido;

        return {
          valorTotalContratos: contratos.valorTotalContratos,
          valorTotalUtilizado: contratos.valorTotalUtilizado,
          executadoAcumulado: previsoes.executadoAcumulado,
          previsaoRestante: previsoes.previsaoRestante,
          totalPrevistoAteFim: previsoes.totalPrevistoAteFim,
          saldoContrato,
          totalEmpenhado: previsoes.totalEmpenhado,
          saldoEmpenho,
          reforcoEmpenhoNecessario: previsoes.reforcoEmpenhoNecessario,
          sobraEmpenho: previsoes.sobraEmpenho,
          reforcoLiquido,
          dotacaoAtualCusteio: siop.dotacaoAtualCusteio,
          empenhadoCusteio: siop.empenhadoCusteio,
          saldoAUtilizarCusteio: siop.saldoAUtilizarCusteio,
          valorDisponivelRemanejamento
        };
      })
    );
  }

  listarRemanejamentos(): Observable<RemanejamentoSugestao[]> {
    return this.http.get<RemanejamentoSugestao[]>(`${BASE}/remanejamentos`);
  }

  criarRemanejamento(sugestao: RemanejamentoSugestao): Observable<RemanejamentoSugestao> {
    return this.http.post<RemanejamentoSugestao>(`${BASE}/remanejamentos`, sugestao);
  }

  excluirRemanejamento(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/remanejamentos/${id}`);
  }
}
