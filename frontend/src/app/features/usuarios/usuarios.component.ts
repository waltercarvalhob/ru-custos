import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService, PerfilUsuario, Usuario } from '../../core/auth.service';
import { DadosUsuario, UsuariosService } from './usuarios.service';

interface Formulario {
  nome: string;
  email: string;
  matricula: string;
  cargo: string;
  setor: string;
  telefone: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  senha: string;
  confirmacao: string;
}

const FORM_VAZIO: Formulario = {
  nome: '',
  email: '',
  matricula: '',
  cargo: '',
  setor: '',
  telefone: '',
  perfil: 'VISUALIZADOR',
  ativo: true,
  senha: '',
  confirmacao: ''
};

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="cabecalho">
      <div>
        <h1>Usuários</h1>
        <p class="subtitulo">Cadastre usuários, defina perfil e senha e aprove novos cadastros</p>
      </div>
      @if (!formAberto()) {
        <button class="btn-pilula btn-pilula--laranja" type="button" (click)="novo()">+ Novo usuário</button>
      }
    </div>

    @if (mensagem()) {
      <p class="sucesso">{{ mensagem() }}</p>
    }
    @if (erro()) {
      <p class="erro">{{ erro() }}</p>
    }

    @if (formAberto()) {
      <section class="cartao">
        <h2>{{ editando() ? 'Editar usuário: ' + editando()!.nome : 'Novo usuário' }}</h2>
        <form class="grade-form" #f="ngForm" (ngSubmit)="salvar(f)">
          <div class="campo campo--largo">
            <label for="u-nome">Nome completo *</label>
            <input id="u-nome" name="nome" [(ngModel)]="form.nome" required maxlength="150" />
          </div>
          <div class="campo campo--largo">
            <label for="u-email">E-mail (usado no login) *</label>
            <input
              id="u-email"
              type="email"
              name="email"
              [(ngModel)]="form.email"
              required
              email
              maxlength="150"
              [disabled]="propriaConta()"
            />
          </div>
          <div class="campo">
            <label for="u-matricula">Matrícula SIAPE</label>
            <input id="u-matricula" name="matricula" [(ngModel)]="form.matricula" maxlength="30" />
          </div>
          <div class="campo">
            <label for="u-cargo">Cargo / Função</label>
            <input id="u-cargo" name="cargo" [(ngModel)]="form.cargo" maxlength="120" />
          </div>
          <div class="campo">
            <label for="u-setor">Setor</label>
            <input id="u-setor" name="setor" [(ngModel)]="form.setor" maxlength="120" />
          </div>
          <div class="campo">
            <label for="u-telefone">Telefone</label>
            <input id="u-telefone" type="tel" name="telefone" [(ngModel)]="form.telefone" maxlength="30" />
          </div>
          <div class="campo">
            <label for="u-perfil">Perfil *</label>
            <select id="u-perfil" name="perfil" [(ngModel)]="form.perfil" [disabled]="propriaConta()">
              @for (p of perfis; track p.valor) {
                <option [value]="p.valor">{{ p.rotulo }}</option>
              }
            </select>
          </div>
          <div class="campo">
            <label for="u-ativo">Situação *</label>
            <select id="u-ativo" name="ativo" [(ngModel)]="form.ativo" [disabled]="propriaConta()">
              <option [ngValue]="true">Ativo (pode entrar)</option>
              <option [ngValue]="false">Desativado</option>
            </select>
          </div>
          <div class="campo">
            <label for="u-senha">{{ editando() ? 'Nova senha (deixe em branco para manter)' : 'Senha *' }}</label>
            <input
              id="u-senha"
              type="password"
              name="senha"
              autocomplete="new-password"
              [(ngModel)]="form.senha"
              [required]="!editando()"
              minlength="6"
              maxlength="72"
            />
          </div>
          <div class="campo">
            <label for="u-confirmacao">Confirmar senha</label>
            <input
              id="u-confirmacao"
              type="password"
              name="confirmacao"
              autocomplete="new-password"
              [(ngModel)]="form.confirmacao"
              [required]="!!form.senha"
            />
          </div>

          <p class="ajuda">
            <strong>Perfis:</strong> Administrador vê, altera e gerencia usuários · Gestor e Visualizador só consultam.
            A senha precisa ter pelo menos 6 caracteres.
          </p>

          <div class="acoes">
            <button class="btn-pilula btn-pilula--laranja" type="submit" [disabled]="f.invalid || salvando()">
              {{ salvando() ? 'Salvando...' : editando() ? 'Salvar alterações' : 'Cadastrar usuário' }}
            </button>
            <button class="btn-pilula btn-cancelar" type="button" (click)="fechar()">Cancelar</button>
          </div>
        </form>
      </section>
    }

    <section class="cartao tabela-secao">
      <table class="tabela">
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Matrícula</th>
            <th>Cargo / Setor</th>
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
              <td>{{ u.matricula || '—' }}</td>
              <td>{{ juntar(u.cargo, u.setor) }}</td>
              <td>{{ rotuloPerfil(u.perfil) }}</td>
              <td>
                <span class="situacao" [class.situacao--ativo]="u.ativo">
                  {{ u.ativo ? 'Ativo' : 'Aguardando aprovação / desativado' }}
                </span>
              </td>
              <td class="acoes-linha">
                <button class="btn-acao" type="button" (click)="editar(u)">Editar</button>
                @if (u.id !== auth.usuarioAtual()?.id) {
                  <button class="btn-acao btn-acao--alerta" type="button" (click)="alternarAtivo(u)">
                    {{ u.ativo ? 'Desativar' : 'Aprovar' }}
                  </button>
                } @else {
                  <span class="sua-conta">Sua conta</span>
                }
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="7">Nenhum usuário encontrado.</td>
            </tr>
          }
        </tbody>
      </table>
    </section>
  `,
  styles: [
    `
      .cabecalho {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      }

      .subtitulo {
        color: #7a6d6a;
        margin: 0;
      }

      .grade-form {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 0 1rem;
        align-items: end;
      }

      .campo--largo {
        grid-column: span 2;
      }

      .ajuda {
        grid-column: 1 / -1;
        font-size: 0.8rem;
        color: #7a6d6a;
        margin: 0 0 0.75rem 0;
      }

      .acoes {
        grid-column: 1 / -1;
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .btn-cancelar {
        background: transparent;
        border: 2px solid var(--borda);
        color: var(--bordo);
      }

      .tabela-secao {
        overflow-x: auto;
      }

      .sucesso {
        color: #1e7b34;
        font-weight: 600;
        margin-bottom: 1rem;
      }

      .erro {
        margin-bottom: 1rem;
      }

      .situacao {
        font-size: 0.85rem;
        color: #b3261e;
      }

      .situacao--ativo {
        color: #1e7b34;
        font-weight: 600;
      }

      .acoes-linha {
        white-space: nowrap;
      }

      .btn-acao {
        background: transparent;
        border: none;
        color: var(--bordo);
        font-weight: 600;
        cursor: pointer;
        padding: 0.25rem 0.5rem;
      }

      .btn-acao--alerta {
        color: #b3261e;
      }

      .sua-conta {
        font-size: 0.85rem;
        color: #7a6d6a;
        padding: 0 0.5rem;
      }

      @media (max-width: 600px) {
        .campo--largo {
          grid-column: 1 / -1;
        }
      }
    `
  ]
})
export class UsuariosComponent implements OnInit {
  readonly perfis: { valor: PerfilUsuario; rotulo: string }[] = [
    { valor: 'ADMIN', rotulo: 'Administrador' },
    { valor: 'GESTOR', rotulo: 'Gestor' },
    { valor: 'VISUALIZADOR', rotulo: 'Visualizador' }
  ];

  usuarios = signal<Usuario[]>([]);
  erro = signal('');
  mensagem = signal('');
  formAberto = signal(false);
  editando = signal<Usuario | null>(null);
  salvando = signal(false);
  form: Formulario = { ...FORM_VAZIO };

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

  propriaConta(): boolean {
    return this.editando()?.id === this.auth.usuarioAtual()?.id;
  }

  rotuloPerfil(perfil: PerfilUsuario): string {
    return this.perfis.find((p) => p.valor === perfil)?.rotulo ?? perfil;
  }

  juntar(...partes: (string | null | undefined)[]): string {
    return partes.filter(Boolean).join(' · ') || '—';
  }

  novo(): void {
    this.limparAvisos();
    this.editando.set(null);
    this.form = { ...FORM_VAZIO };
    this.formAberto.set(true);
  }

  editar(u: Usuario): void {
    this.limparAvisos();
    this.editando.set(u);
    this.form = {
      nome: u.nome,
      email: u.email,
      matricula: u.matricula ?? '',
      cargo: u.cargo ?? '',
      setor: u.setor ?? '',
      telefone: u.telefone ?? '',
      perfil: u.perfil,
      ativo: u.ativo,
      senha: '',
      confirmacao: ''
    };
    this.formAberto.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  fechar(): void {
    this.formAberto.set(false);
    this.editando.set(null);
    this.form = { ...FORM_VAZIO };
  }

  salvar(f: NgForm): void {
    this.limparAvisos();
    if (f.invalid) return;
    if (this.form.senha !== this.form.confirmacao) {
      this.erro.set('A senha e a confirmação não conferem.');
      return;
    }
    const alvo = this.editando();
    const dados: DadosUsuario = {
      nome: this.form.nome.trim(),
      email: alvo && this.propriaConta() ? alvo.email : this.form.email.trim(),
      senha: this.form.senha ? this.form.senha : null,
      perfil: alvo && this.propriaConta() ? alvo.perfil : this.form.perfil,
      ativo: alvo && this.propriaConta() ? true : this.form.ativo,
      matricula: this.form.matricula.trim() || null,
      cargo: this.form.cargo.trim() || null,
      setor: this.form.setor.trim() || null,
      telefone: this.form.telefone.trim() || null
    };
    this.salvando.set(true);
    const pedido = alvo ? this.service.atualizar(alvo.id, dados) : this.service.criar(dados);
    pedido.subscribe({
      next: (u) => {
        this.salvando.set(false);
        this.mensagem.set(alvo ? `Usuário ${u.nome} atualizado.` : `Usuário ${u.nome} cadastrado.`);
        this.fechar();
        this.carregar();
      },
      error: (e: HttpErrorResponse) => {
        this.salvando.set(false);
        this.erro.set(this.mensagemDeErro(e));
      }
    });
  }

  alternarAtivo(u: Usuario): void {
    this.limparAvisos();
    const dados: DadosUsuario = {
      nome: u.nome,
      email: u.email,
      senha: null,
      perfil: u.perfil,
      ativo: !u.ativo,
      matricula: u.matricula ?? null,
      cargo: u.cargo ?? null,
      setor: u.setor ?? null,
      telefone: u.telefone ?? null
    };
    this.service.atualizar(u.id, dados).subscribe({
      next: () => {
        this.mensagem.set(dados.ativo ? `Usuário ${u.nome} aprovado.` : `Usuário ${u.nome} desativado.`);
        this.carregar();
      },
      error: (e: HttpErrorResponse) => {
        this.erro.set(this.mensagemDeErro(e));
        this.carregar();
      }
    });
  }

  private limparAvisos(): void {
    this.erro.set('');
    this.mensagem.set('');
  }

  private mensagemDeErro(e: HttpErrorResponse): string {
    switch (e.status) {
      case 0:
        return 'Não foi possível conectar ao servidor. Tente de novo em alguns segundos.';
      case 400:
        return 'Confira os campos: nome, e-mail válido e senha com pelo menos 6 caracteres.';
      case 403:
        return 'Apenas administradores podem cadastrar ou alterar usuários.';
      case 409:
        return 'Já existe um usuário com esse e-mail.';
      default:
        return `Não foi possível salvar (código ${e.status}).`;
    }
  }
}
