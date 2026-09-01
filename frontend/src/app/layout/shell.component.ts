import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <aside class="barra">
        <div class="barra__marca">
          <span class="marca__selo">SEMPRE+</span>
          <span class="marca__nome">PROAES · UFMA</span>
        </div>
        <nav class="barra__menu">
          <a routerLink="/inicio" routerLinkActive="ativo" class="btn-pilula">INÍCIO</a>
          <a routerLink="/saldo" routerLinkActive="ativo" class="btn-pilula">RESUMO EXECUTIVO</a>
          <a routerLink="/pagamentos" routerLinkActive="ativo" class="btn-pilula">CONTROLE FINANCEIRO</a>
          <a routerLink="/previsoes" routerLinkActive="ativo" class="btn-pilula">CONTROLE ORÇAMENTÁRIO</a>
          <a routerLink="/contratos" routerLinkActive="ativo" class="btn-pilula">CONTRATOS</a>
          <a routerLink="/siop" routerLinkActive="ativo" class="btn-pilula">SIOP</a>
          <a routerLink="/remanejamentos" routerLinkActive="ativo" class="btn-pilula">REMANEJAMENTOS</a>
        </nav>
        <div class="barra__rodape">
          <p class="usuario">{{ auth.usuarioAtual()?.nome }}</p>
          <button class="btn-sair" (click)="sair()">Sair</button>
        </div>
      </aside>
      <main class="conteudo">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      .shell {
        display: flex;
        min-height: 100vh;
      }

      .barra {
        width: 260px;
        flex-shrink: 0;
        background: radial-gradient(circle at 80% 10%, var(--bordo-claro), var(--bordo-escuro) 75%);
        color: var(--branco);
        display: flex;
        flex-direction: column;
        padding: 1.75rem 1.25rem;
        position: sticky;
        top: 0;
        height: 100vh;
      }

      .barra__marca {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        margin-bottom: 2.5rem;
      }

      .marca__selo {
        background: var(--branco);
        color: var(--bordo-escuro);
        font-weight: 800;
        font-size: 0.65rem;
        padding: 0.15rem 0.5rem;
        border-radius: 999px;
        width: fit-content;
      }

      .marca__nome {
        font-weight: 700;
        letter-spacing: 0.06em;
        font-size: 0.75rem;
        color: var(--texto-claro);
      }

      .barra__menu {
        display: flex;
        flex-direction: column;
        gap: 0.9rem;
      }

      .barra__menu a {
        justify-content: flex-start;
        padding-left: 1.5rem;
        text-transform: uppercase;
        font-size: 0.85rem;
      }

      .barra__menu a.ativo {
        background: var(--laranja);
        color: var(--branco);
      }

      .barra__rodape {
        margin-top: auto;
        padding-top: 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
      }

      .usuario {
        font-size: 0.85rem;
        color: var(--texto-claro);
        margin-bottom: 0.5rem;
      }

      .btn-sair {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.4);
        color: var(--branco);
        border-radius: 999px;
        padding: 0.4rem 1rem;
        font-size: 0.8rem;
      }

      .conteudo {
        flex: 1;
        padding: 2.5rem 3vw;
        overflow-y: auto;
      }
    `
  ]
})
export class ShellComponent {
  constructor(public auth: AuthService, private router: Router) {}

  sair(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
