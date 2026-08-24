import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: 'ADMIN' | 'GESTOR' | 'VISUALIZADOR';
}

interface LoginResponse {
  token: string;
  usuario: Usuario;
}

const CHAVE_TOKEN = 'ru-custos.token';
const CHAVE_USUARIO = 'ru-custos.usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  usuarioAtual = signal<Usuario | null>(this.carregarUsuario());

  constructor(private http: HttpClient) {}

  login(email: string, senha: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.authBaseUrl}/login`, { email, senha }).pipe(
      tap((resposta) => {
        localStorage.setItem(CHAVE_TOKEN, resposta.token);
        localStorage.setItem(CHAVE_USUARIO, JSON.stringify(resposta.usuario));
        this.usuarioAtual.set(resposta.usuario);
      })
    );
  }

  registrar(nome: string, email: string, senha: string): Observable<Usuario> {
    return this.http.post<Usuario>(`${environment.authBaseUrl}/registrar`, { nome, email, senha });
  }

  logout(): void {
    localStorage.removeItem(CHAVE_TOKEN);
    localStorage.removeItem(CHAVE_USUARIO);
    this.usuarioAtual.set(null);
  }

  obterToken(): string | null {
    return localStorage.getItem(CHAVE_TOKEN);
  }

  estaAutenticado(): boolean {
    return this.obterToken() !== null;
  }

  private carregarUsuario(): Usuario | null {
    const bruto = localStorage.getItem(CHAVE_USUARIO);
    return bruto ? JSON.parse(bruto) : null;
  }
}
