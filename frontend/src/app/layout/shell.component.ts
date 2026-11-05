import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
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
        <button
          type="button"
          class="btn-menu"
          aria-label="Abrir ou fechar o menu"
          [attr.aria-expanded]="menuAberto()"
          (click)="menuAberto.set(!menuAberto())"
        >
          {{ menuAberto() ? '✕' : '☰' }}
        </button>
        <nav class="barra__menu" [class.aberto]="menuAberto()" (click)="menuAberto.set(false)">
          <a routerLink="/inicio" routerLinkActive="ativo" class="btn-pilula">INÍCIO</a>
          <a routerLink="/saldo" routerLinkActive="ativo" class="btn-pilula">RESUMO EXECUTIVO</a>
          <a routerLink="/pagamentos" routerLinkActive="ativo" class="btn-pilula">CONTROLE FINANCEIRO RU</a>
          <a routerLink="/financeiro-bolsas-auxilios" routerLinkActive="ativo" class="btn-pilula">
            CONTROLE FINANCEIRO BOLSAS E AUXÍLIOS
          </a>
          <a routerLink="/previsoes" routerLinkActive="ativo" class="btn-pilula">CONTROLE ORÇAMENTÁRIO</a>
          <a routerLink="/contratos" routerLinkActive="ativo" class="btn-pilula">CONTRATO RESTAURANTE</a>
          <a routerLink="/siop" routerLinkActive="ativo" class="btn-pilula">SIOP</a>
          <a routerLink="/remanejamentos" routerLinkActive="ativo" class="btn-pilula">REMANEJAMENTOS REALIZADOS RU</a>
          <a routerLink="/remanejamentos-bolsas-auxilios" routerLinkActive="ativo" class="btn-pilula">
            REMANEJAMENTOS REALIZADOS BOLSAS E AUXÍLIOS
          </a>
          @if (auth.ehAdmin()) {
            <a routerLink="/usuarios" routerLinkActive="ativo" class="btn-pilula">USUÁRIOS</a>
          }
        </nav>
        <div class="barra__rodape" [class.aberto]="menuAberto()">
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
        margin-bottom: 1.5rem;
      }

      .btn-menu {
        display: none;
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

      /* Rola sozinho em telas baixas, para o rodape com "Sair" continuar visivel. */
      .barra__menu {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        flex: 1;
        min-height: 0;
        overflow-y: auto;
      }

      .barra__menu a {
        flex-shrink: 0;
        justify-content: flex-start;
        height: 3.5rem;
        padding: 0.35rem 1rem 0.35rem 1.25rem;
        text-transform: uppercase;
        font-size: 0.75rem;
      }

      .barra__menu a.ativo {
        background: var(--laranja);
        color: var(--branco);
      }

      .barra__rodape {
        margin-top: 1rem;
        padding-top: 1rem;
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
        min-width: 0;
        padding: 2.5rem 3vw;
        overflow-y: auto;
      }

      @media (max-width: 900px) {
        .shell {
          flex-direction: column;
        }

        .barra {
          width: 100%;
          height: auto;
          max-height: 100vh;
          padding: 0.75rem 1rem;
          flex-direction: row;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          z-index: 10;
        }

        .barra__marca {
          margin-bottom: 0;
        }

        .btn-menu {
          display: block;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: 8px;
          color: var(--branco);
          font-size: 1.25rem;
          line-height: 1;
          min-width: 2.75rem;
          min-height: 2.75rem;
        }

        .barra__menu,
        .barra__rodape {
          display: none;
          width: 100%;
        }

        .barra__menu.aberto,
        .barra__rodape.aberto {
          display: flex;
        }

        .barra__menu {
          flex: none;
          max-height: 65vh;
          margin-top: 0.75rem;
        }

        .barra__rodape {
          align-items: center;
          justify-content: space-between;
        }

        .usuario {
          margin: 0;
        }

        .conteudo {
          padding: 1.25rem 1rem;
          overflow-y: visible;
        }
      }
    `
  ]
})
export class ShellComponent {
  menuAberto = signal(false);

  constructor(public auth: AuthService) {}

  sair(): void {
    this.auth.logout();
    window.location.href = 'https://ru-custos-frontend.onrender.com/';
  }
}
