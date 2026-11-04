import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { retryAoAcordar } from '../../core/retry-cold-start';
import { environment } from '../../../environments/environment';

export interface PagamentoAuxilio {
  id?: number;
  setor?: string;
  ano: number;
  mes: number;
  dataAbertura?: string;
  numeroProcesso?: string;
  nomeAuxilio: string;
  discentes?: number;
  valorUnitario?: number;
  empenho1?: string;
  valorEmpenho1?: number;
  empenho2?: string;
  valorEmpenho2?: number;
  valorTotal?: number;
  observacao?: string;
}

const BASE = `${environment.pagamentosBaseUrl}/auxilios`;

@Injectable({ providedIn: 'root' })
export class AuxiliosService {
  constructor(private http: HttpClient) {}

  listar(filtros: { setor?: string; ano?: number; mes?: number; auxilio?: string }): Observable<PagamentoAuxilio[]> {
    let params = new HttpParams();
    if (filtros.setor) params = params.set('setor', filtros.setor);
    if (filtros.ano) params = params.set('ano', filtros.ano);
    if (filtros.mes) params = params.set('mes', filtros.mes);
    if (filtros.auxilio) params = params.set('auxilio', filtros.auxilio);
    return this.http.get<PagamentoAuxilio[]>(BASE, { params }).pipe(retryAoAcordar());
  }

  criar(pagamento: PagamentoAuxilio): Observable<PagamentoAuxilio> {
    return this.http.post<PagamentoAuxilio>(BASE, pagamento);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/${id}`);
  }
}
