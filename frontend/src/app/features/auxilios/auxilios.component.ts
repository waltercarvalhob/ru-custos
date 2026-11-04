import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { AuxiliosService, PagamentoAuxilio } from './auxilios.service';

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
          @for (a of pagamentos(); track a.id) {
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

      td small {
        display: block;
        white-space: nowrap;
        color: #7a6d6a;
      }

      .erro {
        color: #b3261e;
        margin-top: 1rem;
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
        this.filtrar();
      },
      error: () => this.erro.set('Não foi possível salvar o pagamento. Confira os campos e tente novamente.')
    });
  }

  excluir(id: number): void {
    this.erro.set('');
    this.service.excluir(id).subscribe({
      next: () => this.filtrar(),
      error: () => this.erro.set('Não foi possível excluir o pagamento.')
    });
  }
}
