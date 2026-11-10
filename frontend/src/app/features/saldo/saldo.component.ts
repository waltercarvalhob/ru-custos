import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { AuxiliosService, PagamentoAuxilio } from '../auxilios/auxilios.service';
import { Pagamento, PagamentosService } from '../pagamentos/pagamentos.service';
import { ContratosResumoDto, SaldoService } from './saldo.service';

const ANO_RESTAURANTE = 2026;

// Soma em centavos para nao acumular erro de ponto flutuante.
function somar(valores: (number | null | undefined)[]): number {
  return valores.reduce<number>((soma, v) => soma + Math.round((v ?? 0) * 100), 0) / 100;
}

@Component({
  selector: 'app-saldo',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    <h1>Resumo Executivo</h1>
    <p class="subtitulo">Bolsas e auxílios e restaurante universitário</p>

    <section class="setor">
      <h2>Bolsas e Auxílios</h2>
      @if (auxilios(); as lista) {
        <div class="kpi-grid">
          @for (t of pagoPorAno(); track t.ano) {
            <div class="kpi">
              <p class="rotulo">Total pago em {{ t.ano }}</p>
              <p class="valor">{{ t.valor | currency: 'BRL' }}</p>
            </div>
          }
          @empty {
            <p>Nenhum pagamento lançado ainda.</p>
          }
        </div>
      } @else if (erroAuxilios()) {
        <p class="erro">Não foi possível carregar os pagamentos de bolsas e auxílios. Recarregue a página.</p>
      } @else {
        <p class="carregando">Carregando...</p>
      }
    </section>

    <section class="setor">
      <h2>Restaurante — {{ anoRestaurante }}</h2>
      @if (contratos() && pagamentosRu()) {
        <div class="kpi-grid">
          <div class="kpi">
            <p class="rotulo">Valor total dos contratos</p>
            <p class="valor">{{ contratos()!.valorTotalContratos | currency: 'BRL' }}</p>
          </div>
          <div class="kpi">
            <p class="rotulo">Valor total pago em {{ anoRestaurante }}</p>
            <p class="valor">{{ pagoRestaurante() | currency: 'BRL' }}</p>
          </div>
          <div class="kpi">
            <p class="rotulo">Saldo de contrato</p>
            <p class="valor">{{ saldoRestaurante() | currency: 'BRL' }}</p>
          </div>
        </div>
        <p class="nota">Saldo de contrato = valor total dos contratos − valor pago em {{ anoRestaurante }}.</p>
      } @else if (erroRestaurante()) {
        <p class="erro">Não foi possível carregar os dados do restaurante. Recarregue a página.</p>
      } @else {
        <p class="carregando">Carregando... no primeiro acesso do dia isso pode levar até 1 minuto.</p>
      }
    </section>
  `,
  styles: [
    `
      .subtitulo {
        color: #7a6d6a;
        margin-bottom: 1.5rem;
      }

      .setor {
        margin-bottom: 2rem;
      }

      .setor h2 {
        margin-bottom: 1rem;
      }

      .nota,
      .carregando {
        color: #7a6d6a;
        font-size: 0.85rem;
        margin-top: 0.75rem;
      }
    `
  ]
})
export class SaldoComponent implements OnInit {
  readonly anoRestaurante = ANO_RESTAURANTE;

  auxilios = signal<PagamentoAuxilio[] | null>(null);
  pagamentosRu = signal<Pagamento[] | null>(null);
  contratos = signal<ContratosResumoDto | null>(null);
  erroAuxilios = signal(false);
  erroRestaurante = signal(false);

  pagoPorAno = computed(() => {
    const lista = this.auxilios() ?? [];
    const anos = [...new Set(lista.map((a) => a.ano))].sort((a, b) => a - b);
    return anos.map((ano) => ({ ano, valor: somar(lista.filter((a) => a.ano === ano).map((a) => a.valorTotal)) }));
  });

  pagoRestaurante = computed(() =>
    somar((this.pagamentosRu() ?? []).filter((p) => p.ano === ANO_RESTAURANTE).map((p) => p.valorPago))
  );

  saldoRestaurante = computed(
    () => Math.round(((this.contratos()?.valorTotalContratos ?? 0) - this.pagoRestaurante()) * 100) / 100
  );

  constructor(
    private saldoService: SaldoService,
    private auxiliosService: AuxiliosService,
    private pagamentosService: PagamentosService
  ) {}

  // Cada setor carrega por conta propria: se um servico falhar, o outro bloco continua aparecendo.
  ngOnInit(): void {
    this.auxiliosService.listar({}).subscribe({
      next: (lista) => this.auxilios.set(lista),
      error: () => this.erroAuxilios.set(true)
    });
    this.pagamentosService.listar({}).subscribe({
      next: (lista) => this.pagamentosRu.set(lista),
      error: () => this.erroRestaurante.set(true)
    });
    this.saldoService.resumoContratos().subscribe({
      next: (r) => this.contratos.set(r),
      error: () => this.erroRestaurante.set(true)
    });
  }
}
