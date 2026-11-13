import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PerfilUsuario, Usuario } from '../../core/auth.service';
import { retryAoAcordar } from '../../core/retry-cold-start';
import { environment } from '../../../environments/environment';

const BASE = `${environment.authBaseUrl}/usuarios`;

/** Dados enviados no cadastro/edicao. Senha nula na edicao mantem a atual. */
export interface DadosUsuario {
  nome: string;
  email: string;
  senha: string | null;
  perfil: PerfilUsuario;
  ativo: boolean;
  matricula: string | null;
  cargo: string | null;
  setor: string | null;
  telefone: string | null;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  constructor(private http: HttpClient) {}

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(BASE).pipe(retryAoAcordar());
  }

  criar(dados: DadosUsuario): Observable<Usuario> {
    return this.http.post<Usuario>(BASE, dados);
  }

  atualizar(id: number, dados: DadosUsuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${BASE}/${id}`, dados);
  }
}
