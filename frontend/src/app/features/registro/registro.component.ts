import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="tela">
      <form class="cartao-login" (ngSubmit)="cadastrar()">
        <p class="marca">PROAES · UFMA</p>
        <h1>Criar conta</h1>
        <div class="campo">
          <label for="nome">Nome</label>
          <input id="nome" type="text" name="nome" [(ngModel)]="nome" required />
        </div>
        <div class="campo">
          <label for="email">Email</label>
          <input id="email" type="email" name="email" [(ngModel)]="email" required />
        </div>
        <div class="campo">
          <label for="senha">Senha</label>
          <input id="senha" type="password" name="senha" [(ngModel)]="senha" minlength="6" required />
        </div>
        @if (mensagemErro) {
          <p class="erro">{{ mensagemErro }}</p>
        }
        @if (mensagemSucesso) {
          <p class="sucesso">{{ mensagemSucesso }}</p>
        }
        <button class="btn-pilula btn-pilula--laranja" type="submit" [disabled]="carregando">
          {{ carregando ? 'Cadastrando...' : 'Cadastrar' }}
        </button>
        <p class="link-registro">
          Já tem conta? <a routerLink="/login">Entrar</a>
        </p>
      </form>
    </div>
  `,
  styles: [
    `
      .tela {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: radial-gradient(circle at 30% 30%, var(--bordo-claro), var(--bordo-escuro) 70%);
        padding: 1.5rem;
      }

      .cartao-login {
        background: var(--branco);
        border-radius: var(--raio);
        box-shadow: var(--sombra);
        padding: 2.5rem;
        width: 100%;
        max-width: 380px;
      }

      .marca {
        color: var(--laranja);
        font-weight: 800;
        letter-spacing: 0.08em;
        font-size: 0.75rem;
        margin: 0 0 0.5rem 0;
      }

      h1 {
        color: var(--bordo-escuro);
        margin-bottom: 1.5rem;
      }

      button {
        width: 100%;
        margin-top: 0.5rem;
      }

      .sucesso {
        color: #1e7a34;
        font-size: 0.85rem;
      }

      .link-registro {
        text-align: center;
        margin-top: 1.25rem;
        font-size: 0.9rem;
      }

      .link-registro a {
        color: var(--bordo);
        font-weight: 700;
        text-decoration: none;
      }
    `
  ]
})
export class RegistroComponent {
  nome = '';
  email = '';
  senha = '';
  carregando = false;
  mensagemErro = '';
  mensagemSucesso = '';

  constructor(private auth: AuthService, private router: Router) {}

  cadastrar(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';
    this.carregando = true;
    this.auth.registrar(this.nome, this.email, this.senha).subscribe({
      next: () => {
        this.carregando = false;
        this.mensagemSucesso = 'Conta criada! Redirecionando para o login...';
        setTimeout(() => this.router.navigate(['/login']), 1200);
      },
      error: (erro) => {
        this.carregando = false;
        this.mensagemErro = erro.status === 409 ? 'Já existe uma conta com esse email.' : 'Não foi possível cadastrar.';
      }
    });
  }
}
