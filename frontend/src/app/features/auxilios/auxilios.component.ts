import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { AuxiliosService, PagamentoAuxilio } from './auxilios.service';

const ITENS_POR_PAGINA = 15;

// A planilha escreve o mesmo auxilio de formas diferentes (ex: "CRECHE" e "Auxílio Creche").
const CATEGORIAS: [RegExp, string][] = [
  [/alimentacao/, 'Alimentação'],
  [/moradia/, 'Moradia'],
  [/transporte|intermunicipal|intramunicipal/, 'Transporte'],
  [/creche/, 'Creche'],
  [/emergencial/, 'Emergencial'],
  [/apoio academico/, 'Apoio Acadêmico'],
  [/aprimoramento/, 'Aprimoramento Acadêmico'],
  [/odontologia/, 'Odontologia'],
  [/eventos/, 'Participação em Eventos'],
  [/promisaes/, 'PROMISAES'],
  [/acessibilidade/, 'Acessibilidade'],
  [/tutoria/, 'Tutoria Inclusiva'],
  [/tecnologia assistiva/, 'Tecnologia Assistiva']
];

function categoriaDoAuxilio(nome: string): string {
  const normalizado = nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  // Auxilio novo, fora da lista, aparece com o proprio nome em vez de sumir do resumo.
  return CATEGORIAS.find(([padrao]) => padrao.test(normalizado))?.[1] ?? nome;
}

@Component({
  selector: 'app-auxilios',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule],
  template: `
    <h1>Controle Financeiro Bolsas e Auxílios</h1>
    <p class="subtitulo">Lançamentos mensais por auxílio e empenho</p>

    <section class="cartao">
      <form class="grade-filtro" (ngSubmit)="filtrar()">
        <div class="campo">
          <label>Setor</label>
          <select name="setor" [(ngModel)]="filtroSetor">
            <option value="">Todos</option>
            @for (s of setores; track s) {
              <option [value]="s">{{ s }}</option>
            }
          </select>
        </div>
        <div class="campo">
          <label>Ano</label>
          <input type="number" name="ano" [(ngModel)]="filtroAno" placeholder="ex: 2026" />
        </div>
        <div class="campo">
          <label>Mês</label>
          <select name="mes" [(ngModel)]="filtroMes">
            <option [ngValue]="null">Todos</option>
            @for (m of meses; track m; let i = $index) {
              <option [ngValue]="i + 1">{{ m }}</option>
            }
          </select>
        </div>
        <div class="campo">
          <label>Auxílio</label>
          <input name="auxilio" [(ngModel)]="filtroAuxilio" placeholder="ex: Creche" />
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
          <h2>Total pago por auxílio</h2>
          <div class="resumo__filtros">
            <div class="campo">
              <label>Tipo de auxílio</label>
              <select [ngModel]="tipoResumoAuxilio()" (ngModelChange)="tipoResumoAuxilio.set($event)">
                <option [ngValue]="null">Todos</option>
                @for (t of tiposAuxilio(); track t) {
                  <option [ngValue]="t">{{ t }}</option>
                }
              </select>
            </div>
            <div class="campo">
              <label>Ano</label>
              <select [ngModel]="anoResumoAuxilio()" (ngModelChange)="anoResumoAuxilio.set($event)">
                <option [ngValue]="null">Todos</option>
                @for (a of anosResumo(); track a) {
                  <option [ngValue]="a">{{ a }}</option>
                }
              </select>
            </div>
          </div>
          <p class="resumo__total">
            Total: <strong>{{ totalResumoAuxilio() | currency: 'BRL' }}</strong>
          </p>
          <div class="resumo__lista">
            <table class="tabela">
              <tbody>
                @for (r of resumoPorAuxilio(); track r.rotulo) {
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
          <label>Setor</label>
          <select name="nsetor" [(ngModel)]="novo.setor">
            <option [ngValue]="undefined"></option>
            @for (s of setores; track s) {
              <option [value]="s">{{ s }}</option>
            }
          </select>
        </div>
        <div class="campo">
          <label>Ano</label>
          <input type="number" name="nano" [(ngModel)]="novo.ano" required />
        </div>
        <div class="campo">
          <label>Mês</label>
          <select name="nmes" [(ngModel)]="novo.mes" required>
            <option [ngValue]="undefined"></option>
            @for (m of meses; track m; let i = $index) {
              <option [ngValue]="i + 1">{{ m }}</option>
            }
          </select>
        </div>
        <div class="campo">
          <label>Abertura do processo</label>
          <input type="date" name="ndata" [(ngModel)]="novo.dataAbertura" />
        </div>
        <div class="campo">
          <label>Nº Processo</label>
          <input name="nprocesso" [(ngModel)]="novo.numeroProcesso" />
        </div>
        <div class="campo">
          <label>Auxílio</label>
          <input name="nauxilio" [(ngModel)]="novo.nomeAuxilio" required />
        </div>
        <div class="campo">
          <label>Discentes</label>
          <input type="number" name="ndiscentes" [(ngModel)]="novo.discentes" />
        </div>
        <div class="campo">
          <label>Valor unitário</label>
          <input type="number" step="0.01" name="nunitario" [(ngModel)]="novo.valorUnitario" />
        </div>
        <div class="campo">
          <label>1º Empenho</label>
          <input name="nempenho1" [(ngModel)]="novo.empenho1" />
        </div>
        <div class="campo">
          <label>Valor 1º Empenho</label>
          <input type="number" step="0.01" name="nvalor1" [(ngModel)]="novo.valorEmpenho1" />
        </div>
        <div class="campo">
          <label>2º Empenho</label>
          <input name="nempenho2" [(ngModel)]="novo.empenho2" />
        </div>
        <div class="campo">
          <label>Valor 2º Empenho</label>
          <input type="number" step="0.01" name="nvalor2" [(ngModel)]="novo.valorEmpenho2" />
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
            <th>Setor</th>
            <th>Abertura</th>
            <th>Processo</th>
            <th>Auxílio</th>
            <th>Discentes</th>
            <th>Valor unit.</th>
            <th>1º Empenho</th>
            <th>2º Empenho</th>
            <th>Valor total</th>
            <th>Observação</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (a of paginaAtual(); track a.id) {
            <tr>
              <td class="sem-quebra">{{ meses[a.mes - 1] }}/{{ a.ano }}</td>
              <td>{{ a.setor }}</td>
              <td>{{ a.dataAbertura | date: 'dd/MM/yyyy' }}</td>
              <td>{{ a.numeroProcesso }}</td>
              <td>{{ a.nomeAuxilio }}</td>
              <td>{{ a.discentes }}</td>
              <td class="sem-quebra">{{ a.valorUnitario != null ? (a.valorUnitario | currency: 'BRL') : 'variável' }}</td>
              <td>
                {{ a.empenho1 }}
                @if (a.valorEmpenho1) {
                  <small>{{ a.valorEmpenho1 | currency: 'BRL' }}</small>
                }
              </td>
              <td>
                {{ a.empenho2 }}
                @if (a.valorEmpenho2) {
                  <small>{{ a.valorEmpenho2 | currency: 'BRL' }}</small>
                }
              </td>
              <td class="sem-quebra">{{ a.valorTotal | currency: 'BRL' }}</td>
              <td>{{ a.observacao }}</td>
              <td>
                @if (auth.ehAdmin()) {
                  <button class="btn-excluir" (click)="excluir(a.id!)">Excluir</button>
                }
              </td>
            </tr>
          }
          @empty {
            <tr>
              <td colspan="12">Nenhum pagamento encontrado.</td>
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

      .tabela th,
      .tabela td {
        padding-left: 0.4rem;
        padding-right: 0.4rem;
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

      td small {
        display: block;
        white-space: nowrap;
        color: #7a6d6a;
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
export class AuxiliosComponent implements OnInit {
  readonly setores = ['DAE', 'DACES'];
  readonly meses = [
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

  pagamentos = signal<PagamentoAuxilio[]>([]);
  erro = signal('');

  anoResumoMes = signal<number | null>(null);
  mesResumoMes = signal<number | null>(null);
  anoResumoAuxilio = signal<number | null>(null);
  tipoResumoAuxilio = signal<string | null>(null);

  anosResumo = computed(() => [...new Set(this.pagamentos().map((a) => a.ano))].sort((a, b) => b - a));
  tiposAuxilio = computed(() =>
    [...new Set(this.pagamentos().map((a) => categoriaDoAuxilio(a.nomeAuxilio)))].sort((a, b) => a.localeCompare(b))
  );

  private linhasResumoMes = computed(() => this.noPeriodo(this.anoResumoMes(), this.mesResumoMes()));
  private linhasResumoAuxilio = computed(() => {
    const tipo = this.tipoResumoAuxilio();
    return this.noPeriodo(this.anoResumoAuxilio(), null).filter(
      (a) => tipo === null || categoriaDoAuxilio(a.nomeAuxilio) === tipo
    );
  });

  totalResumoMes = computed(() => this.somar(() => 0, this.linhasResumoMes())[0]?.valor ?? 0);
  totalResumoAuxilio = computed(() => this.somar(() => 0, this.linhasResumoAuxilio())[0]?.valor ?? 0);

  resumoPorMes = computed(() =>
    this.somar((a) => a.ano * 100 + a.mes, this.linhasResumoMes())
      .sort((a, b) => b.chave - a.chave)
      .map((r) => ({ rotulo: `${this.meses[r.chave % 100 - 1]}/${Math.floor(r.chave / 100)}`, valor: r.valor }))
  );
  resumoPorAno = computed(() =>
    this.somar((a) => a.ano)
      .sort((a, b) => b.chave - a.chave)
      .map((r) => ({ rotulo: String(r.chave), valor: r.valor }))
  );
  resumoPorAuxilio = computed(() =>
    this.somar((a) => categoriaDoAuxilio(a.nomeAuxilio), this.linhasResumoAuxilio())
      .sort((a, b) => b.valor - a.valor)
      .map((r) => ({ rotulo: r.chave, valor: r.valor }))
  );
  totalGeral = computed(() => this.somar(() => 0)[0]?.valor ?? 0);

  private paginaPedida = signal(1);
  totalPaginas = computed(() => Math.max(1, Math.ceil(this.pagamentos().length / ITENS_POR_PAGINA)));
  // Limita ao total: excluir o ultimo item da ultima pagina volta para a anterior.
  pagina = computed(() => Math.min(this.paginaPedida(), this.totalPaginas()));
  paginaAtual = computed(() => {
    const inicio = (this.pagina() - 1) * ITENS_POR_PAGINA;
    return this.pagamentos().slice(inicio, inicio + ITENS_POR_PAGINA);
  });

  filtroSetor = '';
  filtroAno: number | null = null;
  filtroMes: number | null = null;
  filtroAuxilio = '';

  novo: Partial<PagamentoAuxilio> = {};

  constructor(public auth: AuthService, private service: AuxiliosService) {}

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

  private noPeriodo(ano: number | null, mes: number | null): PagamentoAuxilio[] {
    return this.pagamentos().filter((a) => (ano === null || a.ano === ano) && (mes === null || a.mes === mes));
  }

  // Soma em centavos para nao acumular erro de ponto flutuante.
  private somar<T>(
    chaveDe: (a: PagamentoAuxilio) => T,
    linhas: PagamentoAuxilio[] = this.pagamentos()
  ): { chave: T; valor: number }[] {
    const centavos = new Map<T, number>();
    for (const a of linhas) {
      const chave = chaveDe(a);
      centavos.set(chave, (centavos.get(chave) ?? 0) + Math.round((a.valorTotal ?? 0) * 100));
    }
    return [...centavos].map(([chave, c]) => ({ chave, valor: c / 100 }));
  }

  private carregar(): void {
    this.service
      .listar({
        setor: this.filtroSetor || undefined,
        ano: this.filtroAno ?? undefined,
        mes: this.filtroMes ?? undefined,
        auxilio: this.filtroAuxilio || undefined
      })
      .subscribe({
        next: (lista) => this.pagamentos.set(lista),
        error: () => this.erro.set('Não foi possível carregar os pagamentos.')
      });
  }

  criar(): void {
    this.erro.set('');
    this.service.criar(this.novo as PagamentoAuxilio).subscribe({
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
