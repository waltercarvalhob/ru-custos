import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { categoriaDoAuxilio, semAcento } from '../auxilios/categorias';
import { Empenho, EmpenhoResumo, OrcamentoService, SetorOrcamento } from './orcamento.service';

/** Uma tela para os dois setores; a rota diz qual (data.setor). */
@Component({
  selector: 'app-orcamento',
  standalone: true,
  imports: [CurrencyPipe, FormsModule],
  template: `
    <h1>{{ ehRu ? 'Controle Orçamentário RU' : 'Controle Orçamentário Bolsas e Auxílios' }}</h1>
    <p class="subtitulo">
      Valor pago somado automaticamente dos lançamentos do
      {{ ehRu ? 'Controle Financeiro RU' : 'Controle Financeiro Bolsas e Auxílios' }}
    </p>

    <section class="cartao">
      <div class="grade-filtro">
        <div class="campo">
          <label>Ano</label>
          <select [ngModel]="filtroAno()" (ngModelChange)="filtroAno.set($event)">
            <option [ngValue]="null">Todos</option>
            @for (a of anos(); track a) {
              <option [ngValue]="a">{{ a }}</option>
            }
          </select>
        </div>
        <div class="campo">
          <label>Buscar</label>
          <input
            [ngModel]="busca()"
            (ngModelChange)="busca.set($event)"
            [placeholder]="ehRu ? 'empenho ou contrato' : 'empenho ou auxílio'"
          />
        </div>
      </div>
    </section>

    @if (auth.ehAdmin()) {
      <section class="cartao">
        <h2>Novo empenho</h2>
        <p class="ajuda">
          Empenhos usados nos lançamentos já aparecem na tabela: basta informar o valor deles lá. Use este
          formulário só para um empenho que ainda não tem pagamento.
        </p>
        <form class="grade-form" #formNovo="ngForm" (ngSubmit)="criar()">
          <div class="campo">
            <label>Nº Empenho</label>
            <input name="numero" [(ngModel)]="novo.numero" required />
          </div>
          <div class="campo">
            <label>Ano</label>
            <input type="number" name="ano" [(ngModel)]="novo.ano" required />
          </div>
          @if (ehRu) {
            <div class="campo">
              <label>Nº Contrato</label>
              <input name="contrato" [(ngModel)]="novo.numeroContrato" />
            </div>
          }
          <div class="campo">
            <label>Valor do empenho</label>
            <input type="number" step="0.01" name="valor" [(ngModel)]="novo.valor" required />
          </div>
          <button class="btn-pilula btn-pilula--laranja" type="submit" [disabled]="formNovo.invalid">
            Adicionar empenho
          </button>
        </form>
      </section>
    }

    @if (erro()) {
      <p class="erro">{{ erro() }}</p>
    }

    <section class="cartao tabela-secao">
      <table class="tabela">
        <thead>
          <tr>
            <th>Ano</th>
            <th>{{ ehRu ? 'Nº Contrato' : 'Auxílio' }}</th>
            <th>Nº Empenho</th>
            <th class="numero">Valor do empenho</th>
            <th class="numero">Valor pago</th>
            <th class="numero">Saldo do empenho</th>
            @if (auth.ehAdmin()) {
              <th></th>
            }
          </tr>
        </thead>
        <tbody>
          @for (e of filtrados(); track e.numero) {
            <tr>
              <td>{{ e.ano }}</td>
              <td>{{ ehRu ? e.numeroContrato : auxiliosDe(e) }}</td>
              <td class="sem-quebra">{{ e.numero }}</td>
              <td class="numero">
                @if (auth.ehAdmin()) {
                  <input
                    #valor
                    class="valor-empenho"
                    type="number"
                    step="0.01"
                    [value]="e.valorEmpenho ?? ''"
                    placeholder="informar"
                    aria-label="Valor do empenho"
                    (keyup.enter)="salvar(e, valor.value)"
                  />
                  <button class="btn-acao" (click)="salvar(e, valor.value)">Salvar</button>
                } @else if (e.valorEmpenho !== null) {
                  {{ e.valorEmpenho | currency: 'BRL' }}
                } @else {
                  <span class="vazio">não informado</span>
                }
              </td>
              <td class="numero">{{ e.valorPago | currency: 'BRL' }}</td>
              <td class="numero" [class.negativo]="(e.saldo ?? 0) < 0">
                @if (e.saldo !== null) {
                  {{ e.saldo | currency: 'BRL' }}
                } @else {
                  <span class="vazio">—</span>
                }
              </td>
              @if (auth.ehAdmin()) {
                <td class="sem-quebra">
                  @if (e.id !== null) {
                    <button class="btn-acao" (click)="limpar(e)">Limpar</button>
                  }
                </td>
              }
            </tr>
          }
          @empty {
            <tr>
              <td [attr.colspan]="auth.ehAdmin() ? 7 : 6">Nenhum empenho encontrado.</td>
            </tr>
          }
        </tbody>
        @if (filtrados().length) {
          <tfoot>
            <tr>
              <th colspan="3">Total</th>
              <td class="numero total">{{ totais().empenho | currency: 'BRL' }}</td>
              <td class="numero total">{{ totais().pago | currency: 'BRL' }}</td>
              <td class="numero total">{{ totais().saldo | currency: 'BRL' }}</td>
              @if (auth.ehAdmin()) {
                <td></td>
              }
            </tr>
          </tfoot>
        }
      </table>
      <p class="ajuda">
        O saldo é o valor do empenho menos o valor pago. Os totais de empenho e saldo consideram só os empenhos com
        valor informado.
      </p>
    </section>
  `,
  styles: [
    `
      .subtitulo {
        color: #7a6d6a;
        margin-bottom: 1.5rem;
      }

      .grade-filtro,
      .grade-form {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 1rem;
        align-items: end;
      }

      .tabela-secao {
        margin-top: 1rem;
      }

      .numero {
        text-align: right;
        white-space: nowrap;
      }

      .sem-quebra {
        white-space: nowrap;
      }

      .total {
        font-weight: 700;
        color: var(--bordo-escuro);
      }

      .negativo {
        color: #b3261e;
        font-weight: 700;
      }

      .vazio {
        color: #7a6d6a;
      }

      .valor-empenho {
        width: 9.5rem;
        padding: 0.35rem 0.5rem;
        border: 1px solid var(--borda);
        border-radius: 6px;
        font: inherit;
        text-align: right;
      }

      .ajuda {
        color: #7a6d6a;
        font-size: 0.85rem;
        margin: 0.5rem 0 1rem 0;
      }

      .erro {
        margin: 1rem 0;
      }

      .btn-acao {
        background: transparent;
        border: none;
        color: #b3261e;
        font-weight: 600;
      }
    `
  ]
})
export class OrcamentoComponent implements OnInit {
  private service = inject(OrcamentoService);
  auth = inject(AuthService);

  readonly setor: SetorOrcamento = inject(ActivatedRoute).snapshot.data['setor'];
  readonly ehRu = this.setor === 'RU';

  empenhos = signal<EmpenhoResumo[]>([]);
  erro = signal('');
  filtroAno = signal<number | null>(null);
  busca = signal('');

  novo: Partial<Empenho> = {};

  anos = computed(() =>
    [...new Set(this.empenhos().map((e) => e.ano).filter((a): a is number => a !== null))].sort((a, b) => b - a)
  );

  filtrados = computed(() => {
    const ano = this.filtroAno();
    const termo = semAcento(this.busca().trim());
    return this.empenhos().filter(
      (e) =>
        (ano === null || e.ano === ano) &&
        (!termo || semAcento([e.numero, e.numeroContrato ?? '', this.auxiliosDe(e)].join(' ')).includes(termo))
    );
  });

  // Soma em centavos para nao acumular erro de ponto flutuante.
  totais = computed(() => {
    let empenho = 0;
    let pago = 0;
    let saldo = 0;
    for (const e of this.filtrados()) {
      pago += Math.round(e.valorPago * 100);
      if (e.valorEmpenho !== null) {
        empenho += Math.round(e.valorEmpenho * 100);
        saldo += Math.round((e.saldo ?? 0) * 100);
      }
    }
    return { empenho: empenho / 100, pago: pago / 100, saldo: saldo / 100 };
  });

  ngOnInit(): void {
    this.carregar();
  }

  auxiliosDe(e: EmpenhoResumo): string {
    return [...new Set(e.auxilios.map(categoriaDoAuxilio))].sort().join(', ');
  }

  criar(): void {
    this.erro.set('');
    this.service.criar({ ...(this.novo as Empenho), setor: this.setor }).subscribe({
      next: () => {
        this.novo = {};
        this.carregar();
      },
      error: (e) =>
        this.erro.set(
          e.status === 409 ? 'Esse empenho já está na tabela: informe o valor nela.' : 'Não foi possível salvar o empenho.'
        )
    });
  }

  salvar(e: EmpenhoResumo, texto: string): void {
    this.erro.set('');
    const valor = texto === '' ? null : Number(texto);
    const dados: Empenho = {
      setor: this.setor,
      numero: e.numero,
      ano: e.ano,
      numeroContrato: this.ehRu ? e.numeroContrato : null,
      valor
    };
    const pedido = e.id === null ? this.service.criar(dados) : this.service.atualizar(e.id, dados);
    pedido.subscribe({
      next: () => this.carregar(),
      error: () => this.erro.set(`Não foi possível salvar o valor do empenho ${e.numero}.`)
    });
  }

  limpar(e: EmpenhoResumo): void {
    this.erro.set('');
    this.service.excluir(e.id!).subscribe({
      next: () => this.carregar(),
      error: () => this.erro.set(`Não foi possível limpar o empenho ${e.numero}.`)
    });
  }

  private carregar(): void {
    this.service.listar(this.setor).subscribe({
      next: (lista) => this.empenhos.set(lista),
      error: () => this.erro.set('Não foi possível carregar os empenhos.')
    });
  }
}
