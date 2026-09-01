import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { SaldoResumo, SaldoService } from '../saldo/saldo.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <h1>Dashboard dos Resultados Consolidados</h1>
    <p class="subtitulo">Visão geral — contratos, execução financeira e orçamento SIOP</p>

    @if (resumo(); as r) {
      <div class="cards-grid">
        <div class="card card--azul">
          <p class="rotulo">Valor total dos contratos</p>
          <p class="valor">{{ r.valorTotalContratos | currency: 'BRL' }}</p>
        </div>
        <div class="card card--verde">
          <p class="rotulo">Executado acumulado</p>
          <p class="valor">{{ r.executadoAcumulado | currency: 'BRL' }}</p>
        </div>
        <div class="card card--laranja">
          <p class="rotulo">Saldo de contrato</p>
          <p class="valor">{{ r.saldoContrato | currency: 'BRL' }}</p>
        </div>
        <div class="card card--bordo">
          <p class="rotulo">Dotação SIOP · Custeio</p>
          <p class="valor">{{ r.dotacaoAtualCusteio | currency: 'BRL' }}</p>
        </div>
      </div>

      <div class="graficos-grid">
        <section class="cartao">
          <h2>Contratado x Executado x Saldo</h2>
          <div class="barras">
            <div class="barra-item">
              <div class="barra barra--azul" [style.height.%]="alturaBarra(r.valorTotalContratos)"></div>
              <p class="barra-valor">{{ r.valorTotalContratos | currency: 'BRL':'symbol':'1.0-0' }}</p>
              <p class="barra-rotulo">Contratado</p>
            </div>
            <div class="barra-item">
              <div class="barra barra--verde" [style.height.%]="alturaBarra(r.executadoAcumulado)"></div>
              <p class="barra-valor">{{ r.executadoAcumulado | currency: 'BRL':'symbol':'1.0-0' }}</p>
              <p class="barra-rotulo">Executado</p>
            </div>
            <div class="barra-item">
              <div class="barra barra--laranja" [style.height.%]="alturaBarra(r.saldoContrato)"></div>
              <p class="barra-valor">{{ r.saldoContrato | currency: 'BRL':'symbol':'1.0-0' }}</p>
              <p class="barra-rotulo">Saldo</p>
            </div>
          </div>
        </section>

        <section class="cartao">
          <h2>Execução do contrato</h2>
          <div class="pizza-wrap">
            <div class="pizza" [style.background]="gradientePizza()"></div>
            <ul class="legenda">
              <li><span class="ponto ponto--verde"></span> Executado ({{ percentualExecutado() }}%)</li>
              <li><span class="ponto ponto--laranja"></span> Saldo ({{ 100 - percentualExecutado() }}%)</li>
            </ul>
          </div>
        </section>
      </div>
    } @else if (erro()) {
      <p class="erro">Não foi possível carregar o dashboard. Verifique se todos os serviços estão no ar.</p>
    } @else {
      <p>Carregando...</p>
    }
  `,
  styles: [
    `
      .subtitulo {
        color: #7a6d6a;
        margin-bottom: 1.5rem;
      }

      .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .card {
        border-radius: var(--raio);
        box-shadow: var(--sombra);
        padding: 1.25rem;
        color: var(--branco);
      }

      .card--azul {
        background: #1f5da8;
      }

      .card--verde {
        background: #2e8b57;
      }

      .card--laranja {
        background: var(--laranja);
      }

      .card--bordo {
        background: var(--bordo-escuro);
      }

      .card .rotulo {
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        opacity: 0.9;
      }

      .card .valor {
        font-size: 1.4rem;
        font-weight: 800;
        margin-top: 0.35rem;
      }

      .graficos-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 1rem;
      }

      .barras {
        display: flex;
        align-items: flex-end;
        justify-content: space-around;
        height: 220px;
        gap: 1.5rem;
        padding-top: 1rem;
      }

      .barra-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        height: 100%;
      }

      .barra {
        width: 100%;
        max-width: 64px;
        border-radius: 8px 8px 0 0;
        transition: height 0.3s ease;
      }

      .barra--azul {
        background: #1f5da8;
      }

      .barra--verde {
        background: #2e8b57;
      }

      .barra--laranja {
        background: var(--laranja);
      }

      .barra-valor {
        font-size: 0.75rem;
        font-weight: 700;
        margin-top: 0.5rem;
        color: var(--bordo-escuro);
      }

      .barra-rotulo {
        font-size: 0.75rem;
        color: #7a6d6a;
      }

      .pizza-wrap {
        display: flex;
        align-items: center;
        gap: 2rem;
        padding-top: 1rem;
        flex-wrap: wrap;
      }

      .pizza {
        width: 160px;
        height: 160px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .legenda {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        font-size: 0.9rem;
      }

      .ponto {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-right: 0.5rem;
      }

      .ponto--verde {
        background: #2e8b57;
      }

      .ponto--laranja {
        background: var(--laranja);
      }
    `
  ]
})
export class InicioComponent implements OnInit {
  resumo = signal<SaldoResumo | null>(null);
  erro = signal(false);

  constructor(private saldoService: SaldoService) {}

  ngOnInit(): void {
    this.saldoService.resumo().subscribe({
      next: (r) => this.resumo.set(r),
      error: () => this.erro.set(true)
    });
  }

  alturaBarra(valor: number): number {
    const r = this.resumo();
    if (!r) {
      return 0;
    }
    const maior = Math.max(r.valorTotalContratos, r.executadoAcumulado, r.saldoContrato, 1);
    return Math.max(0, Math.min(100, (valor / maior) * 100));
  }

  percentualExecutado(): number {
    const r = this.resumo();
    if (!r || r.valorTotalContratos <= 0) {
      return 0;
    }
    return Math.round((r.executadoAcumulado / r.valorTotalContratos) * 100);
  }

  gradientePizza(): string {
    const p = this.percentualExecutado();
    return `conic-gradient(#2e8b57 0% ${p}%, var(--laranja) ${p}% 100%)`;
  }
}
