import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Campus, Contrato, ContratosService } from './contratos.service';

@Component({
  selector: 'app-contratos',
  standalone: true,
  imports: [CurrencyPipe, FormsModule],
  template: `
    <h1>Contratos do RU</h1>
    <p class="subtitulo">Contratos por campus, valores e vigência</p>

    <section class="cartao">
      <h2>Novo contrato</h2>
      <form class="grade-form" (ngSubmit)="criar()">
        <div class="campo">
          <label>Campus</label>
          <select name="campus" [(ngModel)]="novoCampusId" required>
            <option [ngValue]="null" disabled>Selecione...</option>
            @for (c of campusList(); track c.id) {
              <option [ngValue]="c.id">{{ c.nome }}</option>
            }
          </select>
        </div>
        <div class="campo">
          <label>Empresa</label>
          <input name="empresa" [(ngModel)]="novo.empresa" required />
        </div>
        <div class="campo">
          <label>Nº Contrato</label>
          <input name="numeroContrato" [(ngModel)]="novo.numeroContrato" required />
        </div>
        <div class="campo">
          <label>Valor contratual</label>
          <input type="number" name="valorContratual" [(ngModel)]="novo.valorContratual" required />
        </div>
        <div class="campo">
          <label>Valor utilizado</label>
          <input type="number" name="valorUtilizado" [(ngModel)]="novo.valorUtilizado" />
        </div>
        <div class="campo">
          <label>Saldo</label>
          <input type="number" name="saldo" [(ngModel)]="novo.saldo" />
        </div>
        <div class="campo">
          <label>Vigência final</label>
          <input type="date" name="vigenciaFim" [(ngModel)]="novo.vigenciaFim" />
        </div>
        <div class="campo">
          <label>Status</label>
          <input name="status" [(ngModel)]="novo.status" />
        </div>
        <button class="btn-pilula btn-pilula--laranja" type="submit">Adicionar contrato</button>
      </form>

      <details class="novo-campus">
        <summary>Cadastrar novo campus</summary>
        <form class="linha-campus" (ngSubmit)="criarCampus()">
          <input name="nomeCampus" placeholder="Nome do campus" [(ngModel)]="nomeNovoCampus" required />
          <button class="btn-pilula" type="submit">Salvar</button>
        </form>
      </details>
    </section>

    <section class="cartao tabela-secao">
      <table class="tabela">
        <thead>
          <tr>
            <th>Campus</th>
            <th>Empresa</th>
            <th>Contrato</th>
            <th>Valor contratual</th>
            <th>Utilizado</th>
            <th>Saldo</th>
            <th>Vigência</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (c of contratos(); track c.id) {
            <tr>
              <td>{{ c.campus.nome }}</td>
              <td>{{ c.empresa }}</td>
              <td>{{ c.numeroContrato }}</td>
              <td>{{ c.valorContratual | currency: 'BRL' }}</td>
              <td>{{ c.valorUtilizado | currency: 'BRL' }}</td>
              <td>{{ c.saldo | currency: 'BRL' }}</td>
              <td>{{ c.vigenciaFim }}</td>
              <td>{{ c.status }}</td>
              <td><button class="btn-excluir" (click)="excluir(c.id!)">Excluir</button></td>
            </tr>
          }
          @empty {
            <tr>
              <td colspan="9">Nenhum contrato cadastrado ainda.</td>
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

      .grade-form {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
        align-items: end;
      }

      .grade-form button {
        height: fit-content;
      }

      .novo-campus {
        margin-top: 1.25rem;
      }

      .linha-campus {
        display: flex;
        gap: 0.75rem;
        margin-top: 0.75rem;
      }

      .linha-campus input {
        padding: 0.55rem 0.75rem;
        border: 1px solid var(--borda);
        border-radius: 8px;
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
export class ContratosComponent implements OnInit {
  campusList = signal<Campus[]>([]);
  contratos = signal<Contrato[]>([]);

  novoCampusId: number | null = null;
  novo: Partial<Contrato> = {};
  nomeNovoCampus = '';

  constructor(private service: ContratosService) {}

  ngOnInit(): void {
    this.carregarCampus();
    this.carregarContratos();
  }

  carregarCampus(): void {
    this.service.listarCampus().subscribe((lista) => this.campusList.set(lista));
  }

  carregarContratos(): void {
    this.service.listarContratos().subscribe((lista) => this.contratos.set(lista));
  }

  criar(): void {
    if (!this.novoCampusId) {
      return;
    }
    const contrato: Contrato = {
      ...(this.novo as Contrato),
      campus: { id: this.novoCampusId, nome: '' }
    };
    this.service.criarContrato(contrato).subscribe(() => {
      this.novo = {};
      this.novoCampusId = null;
      this.carregarContratos();
    });
  }

  criarCampus(): void {
    if (!this.nomeNovoCampus.trim()) {
      return;
    }
    this.service.criarCampus({ nome: this.nomeNovoCampus }).subscribe(() => {
      this.nomeNovoCampus = '';
      this.carregarCampus();
    });
  }

  excluir(id: number): void {
    this.service.excluirContrato(id).subscribe(() => this.carregarContratos());
  }
}
