import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PlanoOrcamentario {
  id?: number;
  localizador?: string;
  planoOrcamentario: string;
  projetoLei: number;
  dotacaoInicial: number;
  dotacaoAtual: number;
  empenhado: number;
  liquidado: number;
  pago: number;
}

export type TipoAcaoOrcamentaria = 'CUSTEIO' | 'CAPITAL';

export interface AcaoOrcamentaria {
  id?: number;
  acao: string;
  discriminacao: string;
  tipo: TipoAcaoOrcamentaria;
  dotacaoPloaCusteio: number;
  dotacaoAnuladaPloa: number;
  dotacaoInicialLoaCusteio: number;
  recomposicaoPloa: number;
  dotacaoAutorizada: number;
  remanejadoCancelado: number;
  creditoSuplementar: number;
  dotacaoAtualizada: number;
  executado: number;
  saldoAtualizar: number;
  atualizadoEm?: string;
}

const BASE = environment.siopBaseUrl;

@Injectable({ providedIn: 'root' })
export class SiopService {
  constructor(private http: HttpClient) {}

  listarPlanos(): Observable<PlanoOrcamentario[]> {
    return this.http.get<PlanoOrcamentario[]>(`${BASE}/planos-orcamentarios`);
  }

  criarPlano(plano: PlanoOrcamentario): Observable<PlanoOrcamentario> {
    return this.http.post<PlanoOrcamentario>(`${BASE}/planos-orcamentarios`, plano);
  }

  listarAcoes(): Observable<AcaoOrcamentaria[]> {
    return this.http.get<AcaoOrcamentaria[]>(`${BASE}/acoes-orcamentarias`);
  }

  criarAcao(acao: AcaoOrcamentaria): Observable<AcaoOrcamentaria> {
    return this.http.post<AcaoOrcamentaria>(`${BASE}/acoes-orcamentarias`, acao);
  }
}
