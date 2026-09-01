import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { retryAoAcordar } from '../../core/retry-cold-start';
import { environment } from '../../../environments/environment';

export interface Pagamento {
  id?: number;
  campus: string;
  mesReferencia: string;
  empresa: string;
  numeroContrato?: string;
  numeroProcessoContratacao?: string;
  modalidade?: string;
  numeroProcessoPagamento?: string;
  recurso?: string;
  ne?: string;
  valorNe?: number;
  numeroNf?: string;
  valorNf?: number;
  glosa?: number;
  valorPago?: number;
  observacao?: string;
  ano?: number;
}

const BASE = environment.pagamentosBaseUrl;

@Injectable({ providedIn: 'root' })
export class PagamentosService {
  constructor(private http: HttpClient) {}

  listar(filtros: { campus?: string; mesReferencia?: string; numeroContrato?: string }): Observable<Pagamento[]> {
    let params = new HttpParams();
    if (filtros.campus) params = params.set('campus', filtros.campus);
    if (filtros.mesReferencia) params = params.set('mesReferencia', filtros.mesReferencia);
    if (filtros.numeroContrato) params = params.set('numeroContrato', filtros.numeroContrato);
    return this.http.get<Pagamento[]>(BASE, { params }).pipe(retryAoAcordar());
  }

  criar(pagamento: Pagamento): Observable<Pagamento> {
    return this.http.post<Pagamento>(BASE, pagamento);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/${id}`);
  }
}
