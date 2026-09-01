import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { retryAoAcordar } from '../../core/retry-cold-start';
import { environment } from '../../../environments/environment';

export interface Campus {
  id?: number;
  nome: string;
}

export interface Contrato {
  id?: number;
  campus: Campus;
  empresa: string;
  numeroContrato: string;
  processoContratacao?: string;
  valorContratual: number;
  valorUtilizado?: number;
  saldo?: number;
  vigenciaFim?: string;
  status?: string;
}

export interface Empenho {
  id?: number;
  contrato: { id: number };
  numeroNe?: string;
  saldoEmpenho?: number;
  saldoNe2025Informativo?: number;
  ano?: number;
}

const BASE = environment.contratosBaseUrl;

@Injectable({ providedIn: 'root' })
export class ContratosService {
  constructor(private http: HttpClient) {}

  listarCampus(): Observable<Campus[]> {
    return this.http.get<Campus[]>(`${BASE}/campus`).pipe(retryAoAcordar());
  }

  criarCampus(campus: Campus): Observable<Campus> {
    return this.http.post<Campus>(`${BASE}/campus`, campus);
  }

  listarContratos(): Observable<Contrato[]> {
    return this.http.get<Contrato[]>(BASE).pipe(retryAoAcordar());
  }

  criarContrato(contrato: Contrato): Observable<Contrato> {
    return this.http.post<Contrato>(BASE, contrato);
  }

  atualizarContrato(id: number, contrato: Contrato): Observable<Contrato> {
    return this.http.put<Contrato>(`${BASE}/${id}`, contrato);
  }

  excluirContrato(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/${id}`);
  }

  listarEmpenhos(contratoId: number): Observable<Empenho[]> {
    return this.http.get<Empenho[]>(`${BASE}/empenhos?contratoId=${contratoId}`).pipe(retryAoAcordar());
  }

  criarEmpenho(empenho: Empenho): Observable<Empenho> {
    return this.http.post<Empenho>(`${BASE}/empenhos`, empenho);
  }
}
