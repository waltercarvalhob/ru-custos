import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService, PerfilUsuario, Usuario } from '../../core/auth.service';
import { UsuariosService } from './usuarios.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FormsModule],
  template: `
    <h1>Usuários</h1>
    <p class="subtitulo">Aprove novos cadastros e defina quem pode alterar os lançamentos</p>

    @if (erro()) {
      <p class="erro">{{ erro() }}</p>
    }

    <section class="cartao tabela-secao">
      <table class="tabela">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Perfil</th>
            <th>Situação</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (u of usuarios(); track u.id) {
            <tr>
              <td>{{ u.nome }}</td>
              <td>{{ u.email }}</td>
              @if (u.id === auth.usuarioAtual()?.id) {
                <td>{{ u.perfil }}</td>
                <td>Ativo</td>
                <td>Sua conta</td>
              } @else {
                <td>
                  <select
                    [ngModel]="u.perfil"
                    [ngModelOptions]="{ standalone: true }"
                    (ngModelChange)="salvar(u, $event, u.ativo)"
                  >
                    @for (p of perfis; track p) {
                      <option [value]="p">{{ p }}</option>
                    }
                  </select>
                </td>
                <td>{{ u.ativo ? 'Ativo' : 'Aguardando aprovação / desativado' }}</td>
                <td>
                  <button class="btn-acao" (click)="salvar(u, u.perfil, !u.ativo)">
                    {{ u.ativo ? 'Desativar' : 'Aprovar' }}
                  </button>
                </td>
              }
            </tr>
          }
          @empty {
            <tr>
              <td colspan="5">Nenhum usuário encontrado.</td>
            </tr>
          }
        </tbody>
      </table>
    </section>
  `,
  styles: [
    `
      .subtitulo {
        color: #7a6d6a;
        margin-bottom: 1.5rem;
      }

      .tabela-secao {
        overflow-x: auto;
      }

      .erro {
        color: #b3261e;
        margin-bottom: 1rem;
      }

      .btn-acao {
        background: transparent;
        border: none;
        color: #b3261e;
        font-weight: 600;
      }
    `
  ]
})
export class UsuariosComponent implements OnInit {
  readonly perfis: PerfilUsuario[] = ['VISUALIZADOR', 'GESTOR', 'ADMIN'];

  usuarios = signal<Usuario[]>([]);
  erro = signal('');

  constructor(public auth: AuthService, private service: UsuariosService) {}

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.service.listar().subscribe({
      next: (lista) => this.usuarios.set(lista),
      error: () => this.erro.set('Não foi possível carregar os usuários. Esta página é restrita a administradores.')
    });
  }

  salvar(usuario: Usuario, perfil: PerfilUsuario, ativo: boolean): void {
    this.erro.set('');
    this.service.atualizar(usuario.id, { perfil, ativo }).subscribe({
      next: () => this.carregar(),
      error: () => {
        this.erro.set('Não foi possível salvar a alteração.');
        this.carregar();
      }
    });
  }
}
