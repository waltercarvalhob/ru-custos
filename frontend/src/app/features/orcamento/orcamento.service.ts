import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { retryAoAcordar } from '../../core/retry-cold-start';
import { environment } from '../../../environments/environment';

export type SetorOrcamento = 'RU' | 'AUXILIOS';

/** Linha do Controle Orçamentário: o valor pago vem dos lançamentos do Controle Financeiro. */
export interface EmpenhoResumo {
  id: number | null;
  setor: SetorOrcamento;
  numero: string;
  ano: number | null;
  numeroContrato: string | null;
  auxilios: string[];
  valorEmpenho: number | null;
  valorPago: number;
  saldo: number | null;
}

export interface Empenho {
  id?: number;
  setor: SetorOrcamento;
  numero: string;
  ano?: number | null;
  numeroContrato?: string | null;
  valor?: number | null;
}

const BASE = `${environment.pagamentosBaseUrl}/empenhos`;

@Injectable({ providedIn: 'root' })
export class OrcamentoService {
  constructor(private http: HttpClient) {}

  listar(setor: SetorOrcamento): Observable<EmpenhoResumo[]> {
    return this.http
      .get<EmpenhoResumo[]>(BASE, { params: new HttpParams().set('setor', setor) })
      .pipe(retryAoAcordar());
  }

  criar(empenho: Empenho): Observable<Empenho> {
    return this.http.post<Empenho>(BASE, empenho);
  }

  atualizar(id: number, empenho: Empenho): Observable<Empenho> {
    return this.http.put<Empenho>(`${BASE}/${id}`, empenho);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/${id}`);
  }
}
