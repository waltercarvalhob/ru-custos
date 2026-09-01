import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CategoriaRemanejamento,
  RemanejamentoSugestao,
  SaldoService
} from '../saldo/saldo.service';

const ROTULOS_CATEGORIA: Record<CategoriaRemanejamento, string> = {
  BOLSAS_AUXILIOS: 'Bolsas e Auxílios',
  APOIO_ACADEMICO: 'Apoio Acadêmico',
  TRANSPORTE_INTERMUNICIPAL: 'Transporte Intermunicipal',
  TRANSPORTE_INTRAMUNICIPAL: 'Transporte Intramunicipal',
  MORADIA_PECUNIARIA: 'Moradia Pecuniária'
};

@Component({
  selector: 'app-remanejamentos',
  standalone: true,
  imports: [CurrencyPipe, FormsModule],
  template: `
    <h1>Remanejamentos</h1>
    <p class="subtitulo">Sugestões de remanejamento entre categorias de despesa</p>

    <section class="cartao">
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
export class RemanejamentosComponent implements OnInit {
  sugestoes = signal<RemanejamentoSugestao[]>([]);

  categorias = Object.keys(ROTULOS_CATEGORIA) as CategoriaRemanejamento[];
  novaCategoria: CategoriaRemanejamento = 'BOLSAS_AUXILIOS';
  novoValor: number | null = null;
  novaObservacao = '';

  constructor(private saldoService: SaldoService) {}

  ngOnInit(): void {
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
