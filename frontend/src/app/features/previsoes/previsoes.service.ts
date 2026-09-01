import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { retryAoAcordar } from '../../core/retry-cold-start';
import { environment } from '../../../environments/environment';

export interface ContratoPrevisao {
  id?: number;
  favorecido: string;
  numeroContrato?: string;
  vigenciaInicio?: string;
  vigenciaFim?: string;
  planoInterno?: string;
  setorSipac?: string;
  objeto?: string;
  valorContrato: number;
  numeroNe?: string;
  empenhado: number;
  processoSei?: string;
  sobraAproveitavel?: boolean;
}

export interface ContratoPrevisaoResumo {
  executadoAcumulado: number;
  mediaMensal: number;
  previsaoRestante: number;
  totalPrevistoAteFim: number;
  saldoEmpenhoPrevisto: number;
  reforcoEmpenhoNecessario: number;
  sobraEmpenho: number;
  sobraAproveitavel: number;
}

export interface ExecucaoMensal {
  id?: number;
  contratoPrevisao: { id: number };
  mesReferencia: string;
  tipo: 'EXECUTADO' | 'PREVISAO';
  valor: number;
}

const BASE = environment.previsoesBaseUrl;

@Injectable({ providedIn: 'root' })
export class PrevisoesService {
  constructor(private http: HttpClient) {}

  listarContratos(): Observable<ContratoPrevisao[]> {
    return this.http.get<ContratoPrevisao[]>(`${BASE}/contratos`).pipe(retryAoAcordar());
  }

  criarContrato(contrato: ContratoPrevisao): Observable<ContratoPrevisao> {
    return this.http.post<ContratoPrevisao>(`${BASE}/contratos`, contrato);
  }

  resumoContrato(id: number): Observable<ContratoPrevisaoResumo> {
    return this.http.get<ContratoPrevisaoResumo>(`${BASE}/contratos/${id}/resumo`).pipe(retryAoAcordar());
  }

  listarExecucoes(contratoPrevisaoId: number): Observable<ExecucaoMensal[]> {
    return this.http
      .get<ExecucaoMensal[]>(`${BASE}/execucoes?contratoPrevisaoId=${contratoPrevisaoId}`)
      .pipe(retryAoAcordar());
  }

  criarExecucao(execucao: ExecucaoMensal): Observable<ExecucaoMensal> {
    return this.http.post<ExecucaoMensal>(`${BASE}/execucoes`, execucao);
  }
}
