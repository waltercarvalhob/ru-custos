import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="hero">
      <div class="hero__circulos" aria-hidden="true"></div>
      <div class="hero__conteudo">
        <p class="hero__marca">
          <span class="marca__selo">SEMPRE+</span>
          <span class="marca__nome">PROAES · UFMA</span>
        </p>
        <h1 class="hero__titulo">
          ANÁLISE<br />
          <span class="hero__titulo--laranja">DE CUSTOS</span>
        </h1>
        <p class="hero__subtitulo">DO RESTAURANTE UNIVERSITÁRIO</p>
        <a class="btn-pilula" [routerLink]="destino()">CONSULTAR</a>
      </div>
    </div>
  `,
  styles: [
    `
      .hero {
        min-height: 100vh;
        display: flex;
        align-items: center;
        position: relative;
        overflow: hidden;
        background: radial-gradient(circle at 30% 30%, var(--bordo-claro), var(--bordo-escuro) 70%);
        color: var(--branco);
        padding: 3rem 6vw;
      }

      .hero__circulos {
        position: absolute;
        inset: 0;
        background-image: repeating-radial-gradient(
          circle at 85% 15%,
          rgba(255, 255, 255, 0.08) 0,
          rgba(255, 255, 255, 0.08) 2px,
          transparent 2px,
          transparent 60px
        );
        pointer-events: none;
      }

      .hero__conteudo {
        position: relative;
        max-width: 640px;
      }

      .hero__marca {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 2.5rem;
      }

      .marca__selo {
        background: var(--branco);
        color: var(--bordo-escuro);
        font-weight: 800;
        font-size: 0.7rem;
        padding: 0.2rem 0.6rem;
        border-radius: 999px;
      }

      .marca__nome {
        font-weight: 700;
        letter-spacing: 0.08em;
        font-size: 0.8rem;
        color: var(--texto-claro);
      }

      .hero__titulo {
        font-size: clamp(2.5rem, 6vw, 4.5rem);
        line-height: 1.05;
        margin-bottom: 0.5rem;
      }

      .hero__titulo--laranja {
        color: var(--laranja);
      }

      .hero__subtitulo {
        color: var(--texto-claro);
        letter-spacing: 0.06em;
        font-weight: 600;
        margin-bottom: 2.5rem;
      }
    `
  ]
})
export class HomeComponent {
  constructor(private auth: AuthService) {}

  destino(): string {
    return this.auth.estaAutenticado() ? '/saldo' : '/login';
  }
}
