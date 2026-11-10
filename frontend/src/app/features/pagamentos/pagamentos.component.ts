import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { semAcento } from '../auxilios/categorias';
import { Pagamento, PagamentosService } from './pagamentos.service';

const ITENS_POR_PAGINA = 15;

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
];

// O mes do RU e texto livre ("Março", "marco"...); 0 quando nao reconhece.
function numeroDoMes(nome: string | undefined): number {
  const alvo = semAcento(nome ?? '').trim();
  return MESES.findIndex((m) => semAcento(m) === alvo) + 1;
}

@Component({
  selector: 'app-pagamentos',
  standalone: true,
  imports: [CurrencyPipe, FormsModule],
  template: `
    <h1>Controle Financeiro RU</h1>
    <p class="subtitulo">Lançamentos mensais por campus e contrato</p>

    <section class="cartao">
      <form class="grade-filtro" (ngSubmit)="filtrar()">
        <div class="campo">
          <label>Campus</label>
          <input name="campus" [(ngModel)]="filtroCampus" placeholder="ex: São Luis" />
        </div>
        <div class="campo">
          <label>Mês</label>
          <select name="mes" [(ngModel)]="filtroMes">
            <option value="">Todos</option>
            @for (m of meses; track m) {
              <option [value]="m">{{ m }}</option>
            }
          </select>
        </div>
        <div class="campo">
          <label>Contrato</label>
          <input name="contrato" [(ngModel)]="filtroContrato" placeholder="ex: 35/2021" />
        </div>
        <button class="btn-pilula btn-pilula--laranja" type="submit">Filtrar</button>
      </form>
    </section>

    @if (pagamentos().length) {
      <div class="resumos">
        <section class="cartao resumo">
          <h2>Total pago por mês</h2>
          <div class="resumo__filtros">
            <div class="campo">
              <label>Mês</label>
              <select [ngModel]="mesResumoMes()" (ngModelChange)="mesResumoMes.set($event)">
                <option [ngValue]="null">Todos</option>
                @for (m of meses; track m; let i = $index) {
                  <option [ngValue]="i + 1">{{ m }}</option>
                }
              </select>
            </div>
            <div class="campo">
              <label>Ano</label>
              <select [ngModel]="anoResumoMes()" (ngModelChange)="anoResumoMes.set($event)">
                <option [ngValue]="null">Todos</option>
                @for (a of anosResumo(); track a) {
                  <option [ngValue]="a">{{ a }}</option>
                }
              </select>
            </div>
          </div>
          <p class="resumo__total">
            Total: <strong>{{ totalResumoMes() | currency: 'BRL' }}</strong>
          </p>
          <div class="resumo__lista">
            <table class="tabela">
              <tbody>
                @for (r of resumoPorMes(); track r.rotulo) {
                  <tr>
                    <td>{{ r.rotulo }}</td>
                    <td class="valor">{{ r.valor | currency: 'BRL' }}</td>
                  </tr>
                }
                @empty {
                  <tr>
                    <td colspan="2">Nenhum pagamento neste período.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>

        <section class="cartao resumo">
          <h2>Total pago por ano</h2>
          <div class="resumo__lista">
            <table class="tabela">
              <tbody>
                @for (r of resumoPorAno(); track r.rotulo) {
                  <tr>
                    <td>{{ r.rotulo }}</td>
                    <td class="valor">{{ r.valor | currency: 'BRL' }}</td>
                  </tr>
                }
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row">Total geral</th>
                  <td class="valor total">{{ totalGeral() | currency: 'BRL' }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <section class="cartao resumo">
          <h2>Total pago por contrato</h2>
          <div class="resumo__filtros">
            <div class="campo">
              <label>Contrato</label>
              <select [ngModel]="contratoResumo()" (ngModelChange)="contratoResumo.set($event)">
                <option [ngValue]="null">Todos</option>
                @for (c of contratos(); track c) {
                  <option [ngValue]="c">{{ c }}</option>
                }
              </select>
            </div>
            <div class="campo">
              <label>Ano</label>
              <select [ngModel]="anoResumoContrato()" (ngModelChange)="anoResumoContrato.set($event)">
                <option [ngValue]="null">Todos</option>
                @for (a of anosResumo(); track a) {
                  <option [ngValue]="a">{{ a }}</option>
                }
              </select>
            </div>
          </div>
          <p class="resumo__total">
            Total: <strong>{{ totalResumoContrato() | currency: 'BRL' }}</strong>
          </p>
          <div class="resumo__lista">
            <table class="tabela">
              <tbody>
                @for (r of resumoPorContrato(); track r.rotulo) {
                  <tr>
                    <td>{{ r.rotulo }}</td>
                    <td class="valor">{{ r.valor | currency: 'BRL' }}</td>
                  </tr>
                }
                @empty {
                  <tr>
                    <td colspan="2">Nenhum pagamento neste período.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      </div>
    }

    @if (auth.ehAdmin()) {
      <section class="cartao">
        <h2>Novo pagamento</h2>
        <form class="grade-form" #formNovo="ngForm" (ngSubmit)="criar()">
          <div class="campo">
            <label>Campus</label>
            <input name="ncampus" [(ngModel)]="novo.campus" required />
          </div>
          <div class="campo">
            <label>Ano</label>
            <input type="number" name="nano" [(ngModel)]="novo.ano" required />
          </div>
          <div class="campo">
            <label>Mês de referência</label>
            <select name="nmes" [(ngModel)]="novo.mesReferencia" required>
              <option [ngValue]="undefined"></option>
              @for (m of meses; track m) {
                <option [value]="m">{{ m }}</option>
              }
            </select>
          </div>
          <div class="campo">
            <label>Empresa</label>
            <input name="nempresa" [(ngModel)]="novo.empresa" required />
          </div>
          <div class="campo">
            <label>Nº Contrato</label>
            <input name="ncontrato" [(ngModel)]="novo.numeroContrato" />
          </div>
          <div class="campo">
            <label>NE</label>
            <input name="nne" [(ngModel)]="novo.ne" />
          </div>
          <div class="campo">
            <label>Nº NF</label>
            <input name="nnf" [(ngModel)]="novo.numeroNf" />
          </div>
          <div class="campo">
            <label>Valor NF</label>
            <input type="number" step="0.01" name="nvalornf" [(ngModel)]="novo.valorNf" />
          </div>
          <div class="campo">
            <label>Valor pago</label>
            <input type="number" step="0.01" name="nvalorpago" [(ngModel)]="novo.valorPago" />
          </div>
          <div class="campo">
            <label>Observação</label>
            <input name="nobs" [(ngModel)]="novo.observacao" />
          </div>
          <button class="btn-pilula btn-pilula--laranja" type="submit" [disabled]="formNovo.invalid">
            Adicionar pagamento
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
            <th>Mês</th>
            <th>Campus</th>
            <th>Empresa</th>
            <th>Contrato</th>
            <th>NE</th>
            <th>NF</th>
            <th>Valor NF</th>
            <th>Valor pago</th>
            <th>Observação</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (p of paginaAtual(); track p.id) {
            <tr>
              <td class="sem-quebra">{{ p.mesReferencia }}{{ p.ano ? '/' + p.ano : '' }}</td>
              <td>{{ p.campus }}</td>
              <td>{{ p.empresa }}</td>
              <td>{{ p.numeroContrato }}</td>
              <td>{{ p.ne }}</td>
              <td>{{ p.numeroNf }}</td>
              <td class="sem-quebra">{{ p.valorNf | currency: 'BRL' }}</td>
              <td class="sem-quebra">{{ p.valorPago ? (p.valorPago | currency: 'BRL') : 'NÃO PAGO' }}</td>
              <td>{{ p.observacao }}</td>
              <td>
                @if (auth.ehAdmin()) {
                  <button class="btn-excluir" (click)="excluir(p.id!)">Excluir</button>
                }
              </td>
            </tr>
          }
          @empty {
            <tr>
              <td colspan="10">Nenhum pagamento encontrado.</td>
            </tr>
          }
        </tbody>
      </table>
      @if (totalPaginas() > 1) {
        <nav class="paginacao">
          <button type="button" class="btn-pagina" [disabled]="pagina() === 1" (click)="irPara(pagina() - 1)">
            Anterior
          </button>
          <span>Página {{ pagina() }} de {{ totalPaginas() }} · {{ pagamentos().length }} lançamentos</span>
          <button
            type="button"
            class="btn-pagina"
            [disabled]="pagina() === totalPaginas()"
            (click)="irPara(pagina() + 1)"
          >
            Próxima
          </button>
        </nav>
      }
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
        margin-top: 2rem;
        overflow-x: auto;
      }

      .tabela {
        font-size: 0.85rem;
      }

      .sem-quebra {
        white-space: nowrap;
      }

      .resumos {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
        gap: 1rem;
        margin: 1rem 0;
      }

      .resumo__filtros {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
      }

      .resumo__total {
        margin: 0 0 0.5rem 0;
        font-size: 0.9rem;
        color: #7a6d6a;
      }

      .resumo__total strong {
        color: var(--bordo-escuro);
      }

      /* Lista longa rola dentro do cartao, para nao empurrar a tabela para baixo. */
      .resumo__lista {
        max-height: 16rem;
        overflow-y: auto;
      }

      .resumo .valor {
        text-align: right;
        white-space: nowrap;
      }

      .resumo .total {
        font-weight: 700;
        color: var(--bordo-escuro);
      }

      .erro {
        color: #b3261e;
        margin-top: 1rem;
      }

      .paginacao {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.75rem 1.5rem;
        margin-top: 1.25rem;
        color: #7a6d6a;
      }

      .btn-pagina {
        background: transparent;
        border: 2px solid var(--bordo);
        border-radius: 999px;
        color: var(--bordo);
        font-weight: 700;
        padding: 0.4rem 1.25rem;
      }

      .btn-pagina:disabled {
        opacity: 0.4;
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
export class PagamentosComponent implements OnInit {
  readonly meses = MESES;

  pagamentos = signal<Pagamento[]>([]);
  erro = signal('');

  private paginaPedida = signal(1);
  totalPaginas = computed(() => Math.max(1, Math.ceil(this.pagamentos().length / ITENS_POR_PAGINA)));
  // Limita ao total: excluir o ultimo item da ultima pagina volta para a anterior.
  pagina = computed(() => Math.min(this.paginaPedida(), this.totalPaginas()));
  paginaAtual = computed(() => {
    const inicio = (this.pagina() - 1) * ITENS_POR_PAGINA;
    return this.pagamentos().slice(inicio, inicio + ITENS_POR_PAGINA);
  });

  anoResumoMes = signal<number | null>(null);
  mesResumoMes = signal<number | null>(null);
  anoResumoContrato = signal<number | null>(null);
  contratoResumo = signal<string | null>(null);

  anosResumo = computed(() =>
    [...new Set(this.pagamentos().map((p) => p.ano).filter((a): a is number => !!a))].sort((a, b) => b - a)
  );
  contratos = computed(() => [...new Set(this.pagamentos().map(contratoDe))].sort());

  private linhasResumoMes = computed(() =>
    this.pagamentos().filter(
      (p) =>
        (this.anoResumoMes() === null || p.ano === this.anoResumoMes()) &&
        (this.mesResumoMes() === null || numeroDoMes(p.mesReferencia) === this.mesResumoMes())
    )
  );
  private linhasResumoContrato = computed(() =>
    this.pagamentos().filter(
      (p) =>
        (this.anoResumoContrato() === null || p.ano === this.anoResumoContrato()) &&
        (this.contratoResumo() === null || contratoDe(p) === this.contratoResumo())
    )
  );

  totalResumoMes = computed(() => this.somar(() => 0, this.linhasResumoMes())[0]?.valor ?? 0);
  totalResumoContrato = computed(() => this.somar(() => 0, this.linhasResumoContrato())[0]?.valor ?? 0);
  totalGeral = computed(() => this.somar(() => 0)[0]?.valor ?? 0);

  resumoPorMes = computed(() =>
    this.somar((p) => (p.ano ?? 0) * 100 + numeroDoMes(p.mesReferencia), this.linhasResumoMes())
      .sort((a, b) => b.chave - a.chave)
      .map((r) => {
        const mes = r.chave % 100;
        const ano = Math.floor(r.chave / 100);
        return { rotulo: `${mes ? MESES[mes - 1] : 'Mês não informado'}/${ano || 'sem ano'}`, valor: r.valor };
      })
  );
  resumoPorAno = computed(() =>
    this.somar((p) => p.ano ?? 0)
      .sort((a, b) => b.chave - a.chave)
      .map((r) => ({ rotulo: r.chave ? String(r.chave) : 'Sem ano', valor: r.valor }))
  );
  resumoPorContrato = computed(() =>
    this.somar(contratoDe, this.linhasResumoContrato())
      .sort((a, b) => b.valor - a.valor)
      .map((r) => ({ rotulo: r.chave, valor: r.valor }))
  );

  filtroCampus = '';
  filtroMes = '';
  filtroContrato = '';

  novo: Partial<Pagamento> = {};

  constructor(public auth: AuthService, private service: PagamentosService) {}

  ngOnInit(): void {
    this.filtrar();
  }

  filtrar(): void {
    this.paginaPedida.set(1);
    this.carregar();
  }

  irPara(pagina: number): void {
    this.paginaPedida.set(pagina);
  }

  // Soma em centavos para nao acumular erro de ponto flutuante.
  private somar<T>(chaveDe: (p: Pagamento) => T, linhas: Pagamento[] = this.pagamentos()): { chave: T; valor: number }[] {
    const centavos = new Map<T, number>();
    for (const p of linhas) {
      const chave = chaveDe(p);
      centavos.set(chave, (centavos.get(chave) ?? 0) + Math.round((p.valorPago ?? 0) * 100));
    }
    return [...centavos].map(([chave, c]) => ({ chave, valor: c / 100 }));
  }

  private carregar(): void {
    this.service
      .listar({
        campus: this.filtroCampus || undefined,
        mesReferencia: this.filtroMes || undefined,
        numeroContrato: this.filtroContrato || undefined
      })
      .subscribe({
        next: (lista) => this.pagamentos.set(lista),
        error: () => this.erro.set('Não foi possível carregar os pagamentos.')
      });
  }

  criar(): void {
    this.erro.set('');
    this.service.criar(this.novo as Pagamento).subscribe({
      next: () => {
        this.novo = {};
        this.carregar();
      },
      error: () => this.erro.set('Não foi possível salvar o pagamento. Confira os campos e tente novamente.')
    });
  }

  excluir(id: number): void {
    this.erro.set('');
    this.service.excluir(id).subscribe({
      next: () => this.carregar(),
      error: () => this.erro.set('Não foi possível excluir o pagamento.')
    });
  }
}

function contratoDe(p: Pagamento): string {
  return p.numeroContrato?.trim() || 'Sem contrato';
}
