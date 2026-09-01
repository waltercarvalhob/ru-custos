import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="tela">
      <form class="cartao-login" (ngSubmit)="entrar()">
        <p class="marca">PROAES · UFMA</p>
        <h1>Entrar</h1>
        <div class="campo">
          <label for="email">Email</label>
          <input id="email" type="email" name="email" [(ngModel)]="email" required />
        </div>
        <div class="campo">
          <label for="senha">Senha</label>
          <input id="senha" type="password" name="senha" [(ngModel)]="senha" required />
        </div>
        @if (mensagemErro) {
          <p class="erro">{{ mensagemErro }}</p>
        }
        <button class="btn-pilula btn-pilula--laranja" type="submit" [disabled]="carregando">
          {{ carregando ? 'Entrando...' : 'Entrar' }}
        </button>
        <p class="link-registro">
          Não tem conta? <a routerLink="/registro">Cadastre-se</a>
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
export class LoginComponent {
  email = '';
  senha = '';
  carregando = false;
  mensagemErro = '';

  constructor(private auth: AuthService, private router: Router) {}

  entrar(): void {
    this.mensagemErro = '';
    this.carregando = true;
    this.auth.login(this.email, this.senha).subscribe({
      next: () => {
        this.carregando = false;
        this.router.navigate(['/inicio']);
      },
      error: (erro) => {
        this.carregando = false;
        if (erro.status === 0) {
          this.mensagemErro = 'Não foi possível conectar ao servidor (gateway em localhost:8080). Verifique se os serviços estão no ar.';
        } else if (erro.status === 401) {
          this.mensagemErro = 'Email ou senha inválidos.';
        } else {
          this.mensagemErro = `Erro inesperado (código ${erro.status}). Veja o console do navegador (F12) para detalhes.`;
        }
        console.error('Falha no login:', erro);
      }
    });
  }
}
