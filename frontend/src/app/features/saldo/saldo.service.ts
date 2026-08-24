import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

@Injectable({ providedIn: 'root' })
export class SaldoService {
  constructor(private http: HttpClient) {}

  resumo(): Observable<SaldoResumo> {
    return this.http.get<SaldoResumo>(`${environment.apiBaseUrl}/saldo/resumo`);
  }

  listarRemanejamentos(): Observable<RemanejamentoSugestao[]> {
    return this.http.get<RemanejamentoSugestao[]>(`${environment.apiBaseUrl}/saldo/remanejamentos`);
  }

  criarRemanejamento(sugestao: RemanejamentoSugestao): Observable<RemanejamentoSugestao> {
    return this.http.post<RemanejamentoSugestao>(`${environment.apiBaseUrl}/saldo/remanejamentos`, sugestao);
  }

  excluirRemanejamento(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiBaseUrl}/saldo/remanejamentos/${id}`);
  }
}
