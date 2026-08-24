import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Pagamento, PagamentosService } from './pagamentos.service';

@Component({
  selector: 'app-pagamentos',
  standalone: true,
  imports: [CurrencyPipe, FormsModule],
  template: `
    <h1>Pagamentos do RU</h1>
    <p class="subtitulo">Lançamentos mensais por campus e contrato</p>

    <section class="cartao">
      <form class="grade-filtro" (ngSubmit)="filtrar()">
        <div class="campo">
          <label>Campus</label>
          <input name="campus" [(ngModel)]="filtroCampus" placeholder="ex: São Luis" />
        </div>
        <div class="campo">
          <label>Mês</label>
          <input name="mes" [(ngModel)]="filtroMes" placeholder="ex: Março" />
        </div>
        <div class="campo">
          <label>Contrato</label>
          <input name="contrato" [(ngModel)]="filtroContrato" placeholder="ex: 35/2021" />
        </div>
        <button class="btn-pilula btn-pilula--laranja" type="submit">Filtrar</button>
      </form>
    </section>

    <section class="cartao">
      <h2>Novo pagamento</h2>
      <form class="grade-form" (ngSubmit)="criar()">
        <div class="campo">
          <label>Campus</label>
          <input name="ncampus" [(ngModel)]="novo.campus" required />
        </div>
        <div class="campo">
          <label>Mês de referência</label>
          <input name="nmes" [(ngModel)]="novo.mesReferencia" required />
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
          <input type="number" name="nvalornf" [(ngModel)]="novo.valorNf" />
        </div>
        <div class="campo">
          <label>Valor pago</label>
          <input type="number" name="nvalorpago" [(ngModel)]="novo.valorPago" />
        </div>
        <div class="campo">
          <label>Observação</label>
          <input name="nobs" [(ngModel)]="novo.observacao" />
        </div>
        <button class="btn-pilula btn-pilula--laranja" type="submit">Adicionar pagamento</button>
      </form>
    </section>

    <section class="cartao tabela-secao">
      <table class="tabela">
        <thead>
          <tr>
            <th>Campus</th>
            <th>Mês</th>
            <th>Empresa</th>
            <th>Contrato</th>
            <th>NF</th>
            <th>Valor NF</th>
            <th>Valor pago</th>
            <th>Observação</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (p of pagamentos(); track p.id) {
            <tr>
              <td>{{ p.campus }}</td>
              <td>{{ p.mesReferencia }}</td>
              <td>{{ p.empresa }}</td>
              <td>{{ p.numeroContrato }}</td>
              <td>{{ p.numeroNf }}</td>
              <td>{{ p.valorNf | currency: 'BRL' }}</td>
              <td>{{ p.valorPago ? (p.valorPago | currency: 'BRL') : 'NÃO PAGO' }}</td>
              <td>{{ p.observacao }}</td>
              <td><button class="btn-excluir" (click)="excluir(p.id!)">Excluir</button></td>
            </tr>
          }
          @empty {
            <tr>
              <td colspan="9">Nenhum pagamento encontrado.</td>
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
  pagamentos = signal<Pagamento[]>([]);

  filtroCampus = '';
  filtroMes = '';
  filtroContrato = '';

  novo: Partial<Pagamento> = {};

  constructor(private service: PagamentosService) {}

  ngOnInit(): void {
    this.filtrar();
  }

  filtrar(): void {
    this.service
      .listar({
        campus: this.filtroCampus || undefined,
        mesReferencia: this.filtroMes || undefined,
        numeroContrato: this.filtroContrato || undefined
      })
      .subscribe((lista) => this.pagamentos.set(lista));
  }

  criar(): void {
    this.service.criar(this.novo as Pagamento).subscribe(() => {
      this.novo = {};
      this.filtrar();
    });
  }

  excluir(id: number): void {
    this.service.excluir(id).subscribe(() => this.filtrar());
  }
}
