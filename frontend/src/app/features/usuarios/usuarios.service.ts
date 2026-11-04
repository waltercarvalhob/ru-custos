import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PerfilUsuario, Usuario } from '../../core/auth.service';
import { retryAoAcordar } from '../../core/retry-cold-start';
import { environment } from '../../../environments/environment';

const BASE = `${environment.authBaseUrl}/usuarios`;

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  constructor(private http: HttpClient) {}

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(BASE).pipe(retryAoAcordar());
  }

  atualizar(id: number, dados: { perfil: PerfilUsuario; ativo: boolean }): Observable<Usuario> {
    return this.http.put<Usuario>(`${BASE}/${id}`, dados);
  }
}
