import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CategoriaRemanejamento,
  RemanejamentoSugestao,
  SaldoResumo,
  SaldoService
} from './saldo.service';

const ROTULOS_CATEGORIA: Record<CategoriaRemanejamento, string> = {
  BOLSAS_AUXILIOS: 'Bolsas e Auxílios',
  APOIO_ACADEMICO: 'Apoio Acadêmico',
  TRANSPORTE_INTERMUNICIPAL: 'Transporte Intermunicipal',
  TRANSPORTE_INTRAMUNICIPAL: 'Transporte Intramunicipal',
  MORADIA_PECUNIARIA: 'Moradia Pecuniária'
};

@Component({
  selector: 'app-saldo',
  standalone: true,
  imports: [CurrencyPipe, FormsModule],
  template: `
    <h1>Saldo Real do RU</h1>
    <p class="subtitulo">Resumo executivo — contratos, previsões de execução e orçamento SIOP</p>

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
          <p class="rotulo">Previsão restante</p>
          <p class="valor">{{ r.previsaoRestante | currency: 'BRL' }}</p>
        </div>
        <div class="kpi">
          <p class="rotulo">Total previsto</p>
          <p class="valor">{{ r.totalPrevistoAteFim | currency: 'BRL' }}</p>
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
          <p class="rotulo">Reforço de empenho necessário</p>
          <p class="valor">{{ r.reforcoEmpenhoNecessario | currency: 'BRL' }}</p>
        </div>
        <div class="kpi">
          <p class="rotulo">Sobra de empenho</p>
          <p class="valor">{{ r.sobraEmpenho | currency: 'BRL' }}</p>
        </div>
        <div class="kpi">
          <p class="rotulo">Saldo a utilizar (SIOP · Custeio)</p>
          <p class="valor">{{ r.saldoAUtilizarCusteio | currency: 'BRL' }}</p>
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

    <section class="cartao secao-remanejamento">
      <h2>Sugestões de remanejamento</h2>
      <form class="form-linha" (ngSubmit)="adicionarSugestao()">
        <select name="categoria" [(ngModel)]="novaCategoria">
          @for (categoria of categorias; track categoria) {
            <option [value]="categoria">{{ rotulo(categoria) }}</option>
          }
        </select>
        <input type="number" name="valor" placeholder="Valor sugerido" [(ngModel)]="novoValor" required />
        <input type="text" name="observacao" placeholder="Observação" [(ngModel)]="novaObservacao" />
        <button class="btn-pilula btn-pilula--laranja" type="submit">Adicionar</button>
      </form>

      <table class="tabela">
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Valor sugerido</th>
            <th>Observação</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (sugestao of sugestoes(); track sugestao.id) {
            <tr>
              <td>{{ rotulo(sugestao.categoria) }}</td>
              <td>{{ sugestao.valorSugerido | currency: 'BRL' }}</td>
              <td>{{ sugestao.observacao }}</td>
              <td><button class="btn-excluir" (click)="excluirSugestao(sugestao.id!)">Excluir</button></td>
            </tr>
          }
          @empty {
            <tr>
              <td colspan="4">Nenhuma sugestão cadastrada ainda.</td>
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

      .secao-remanejamento {
        margin-top: 2rem;
      }

      .form-linha {
        display: flex;
        gap: 0.75rem;
        margin-bottom: 1.25rem;
        flex-wrap: wrap;
      }

      .form-linha select,
      .form-linha input {
        padding: 0.55rem 0.75rem;
        border: 1px solid var(--borda);
        border-radius: 8px;
      }

      .btn-excluir {
        background: transparent;
        border: none;
        color: #b3261e;
        font-weight: 600;
      }
    `
  ]
})
export class SaldoComponent implements OnInit {
  resumo = signal<SaldoResumo | null>(null);
  erro = signal(false);
  sugestoes = signal<RemanejamentoSugestao[]>([]);

  categorias = Object.keys(ROTULOS_CATEGORIA) as CategoriaRemanejamento[];
  novaCategoria: CategoriaRemanejamento = 'BOLSAS_AUXILIOS';
  novoValor: number | null = null;
  novaObservacao = '';

  constructor(private saldoService: SaldoService) {}

  ngOnInit(): void {
    this.saldoService.resumo().subscribe({
      next: (r) => this.resumo.set(r),
      error: () => this.erro.set(true)
    });
    this.carregarSugestoes();
  }

  rotulo(categoria: CategoriaRemanejamento): string {
    return ROTULOS_CATEGORIA[categoria];
  }

  carregarSugestoes(): void {
    this.saldoService.listarRemanejamentos().subscribe((lista) => this.sugestoes.set(lista));
  }

  adicionarSugestao(): void {
    if (this.novoValor === null) {
      return;
    }
    this.saldoService
      .criarRemanejamento({
        categoria: this.novaCategoria,
        valorSugerido: this.novoValor,
        observacao: this.novaObservacao
      })
      .subscribe(() => {
        this.novoValor = null;
        this.novaObservacao = '';
        this.carregarSugestoes();
      });
  }

  excluirSugestao(id: number): void {
    this.saldoService.excluirRemanejamento(id).subscribe(() => this.carregarSugestoes());
  }
}
