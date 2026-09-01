import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { SaldoResumo, SaldoService } from './saldo.service';

@Component({
  selector: 'app-saldo',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <h1>Resumo Executivo</h1>
    <p class="subtitulo">Contratos, execução financeira e orçamento SIOP</p>

    @if (resumo(); as r) {
      <div class="kpi-grid">
        <div class="kpi">
          <p class="rotulo">Valor total dos contratos</p>
          <p class="valor">{{ r.valorTotalContratos | currency: 'BRL' }}</p>
        </div>
        <div class="kpi">
          <p class="rotulo">Executado acumulado</p>
          <p class="valor">{{ r.executadoAcumulado | currency: 'BRL' }}</p>
        </div>
        <div class="kpi">
          <p class="rotulo">Saldo de contrato</p>
          <p class="valor">{{ r.saldoContrato | currency: 'BRL' }}</p>
        </div>
        <div class="kpi">
          <p class="rotulo">Total empenhado</p>
          <p class="valor">{{ r.totalEmpenhado | currency: 'BRL' }}</p>
        </div>
        <div class="kpi">
          <p class="rotulo">Saldo de empenho</p>
          <p class="valor">{{ r.saldoEmpenho | currency: 'BRL' }}</p>
        </div>
        <div class="kpi">
          <p class="rotulo">Disponível para remanejamento</p>
          <p class="valor">{{ r.valorDisponivelRemanejamento | currency: 'BRL' }}</p>
        </div>
      </div>
    } @else if (erro()) {
      <p class="erro">Não foi possível carregar o resumo. Verifique se todos os serviços estão no ar.</p>
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
    `
  ]
})
export class SaldoComponent implements OnInit {
  resumo = signal<SaldoResumo | null>(null);
  erro = signal(false);

  constructor(private saldoService: SaldoService) {}

  ngOnInit(): void {
    this.saldoService.resumo().subscribe({
      next: (r) => this.resumo.set(r),
      error: () => this.erro.set(true)
    });
  }
}
