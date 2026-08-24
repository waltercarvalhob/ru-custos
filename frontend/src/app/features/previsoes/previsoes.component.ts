import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ContratoPrevisao,
  ContratoPrevisaoResumo,
  ExecucaoMensal,
  PrevisoesService
} from './previsoes.service';

@Component({
  selector: 'app-previsoes',
  standalone: true,
  imports: [CurrencyPipe, FormsModule],
  template: `
    <h1>Previsões de execução</h1>
    <p class="subtitulo">Execução mensal e previsão até o fim da vigência de cada contrato</p>

    <section class="cartao">
      <h2>Novo contrato de previsão</h2>
      <form class="grade-form" (ngSubmit)="criarContrato()">
        <div class="campo">
          <label>Favorecido</label>
          <input name="favorecido" [(ngModel)]="novo.favorecido" required />
        </div>
        <div class="campo">
          <label>Nº Contrato</label>
          <input name="numeroContrato" [(ngModel)]="novo.numeroContrato" />
        </div>
        <div class="campo">
          <label>Vigência início</label>
          <input type="date" name="vigenciaInicio" [(ngModel)]="novo.vigenciaInicio" />
        </div>
        <div class="campo">
          <label>Vigência fim</label>
          <input type="date" name="vigenciaFim" [(ngModel)]="novo.vigenciaFim" />
        </div>
        <div class="campo">
          <label>Valor do contrato</label>
          <input type="number" name="valorContrato" [(ngModel)]="novo.valorContrato" required />
        </div>
        <div class="campo">
          <label>Empenhado</label>
          <input type="number" name="empenhado" [(ngModel)]="novo.empenhado" required />
        </div>
        <div class="campo">
          <label>Nº NE</label>
          <input name="numeroNe" [(ngModel)]="novo.numeroNe" />
        </div>
        <div class="campo campo-checkbox">
          <label>
            <input type="checkbox" name="sobraAproveitavel" [(ngModel)]="novo.sobraAproveitavel" />
            Sobra de empenho aproveitável (anulável)
          </label>
        </div>
        <button class="btn-pilula btn-pilula--laranja" type="submit">Adicionar</button>
      </form>
    </section>

    <section class="cartao tabela-secao">
      <table class="tabela">
        <thead>
          <tr>
            <th>Favorecido</th>
            <th>Contrato</th>
            <th>Vigência fim</th>
            <th>Valor contrato</th>
            <th>Empenhado</th>
            <th>Sobra aproveitável</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (c of contratos(); track c.id) {
            <tr>
              <td>{{ c.favorecido }}</td>
              <td>{{ c.numeroContrato }}</td>
              <td>{{ c.vigenciaFim }}</td>
              <td>{{ c.valorContrato | currency: 'BRL' }}</td>
              <td>{{ c.empenhado | currency: 'BRL' }}</td>
              <td>{{ c.sobraAproveitavel ? 'Sim' : 'Não' }}</td>
              <td><button class="btn-pilula" (click)="verResumo(c)">Ver resumo</button></td>
            </tr>
          }
          @empty {
            <tr>
              <td colspan="7">Nenhum contrato cadastrado ainda.</td>
            </tr>
          }
        </tbody>
      </table>
    </section>

    @if (contratoSelecionado(); as sel) {
      <section class="cartao resumo-secao">
        <h2>Resumo — {{ sel.favorecido }}</h2>
        @if (resumo(); as r) {
          <div class="kpi-grid">
            <div class="kpi">
              <p class="rotulo">Executado acumulado</p>
              <p class="valor">{{ r.executadoAcumulado | currency: 'BRL' }}</p>
            </div>
            <div class="kpi">
              <p class="rotulo">Média mensal</p>
              <p class="valor">{{ r.mediaMensal | currency: 'BRL' }}</p>
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
              <p class="rotulo">Saldo do empenho previsto</p>
              <p class="valor">{{ r.saldoEmpenhoPrevisto | currency: 'BRL' }}</p>
            </div>
            <div class="kpi">
              <p class="rotulo">Reforço necessário</p>
              <p class="valor">{{ r.reforcoEmpenhoNecessario | currency: 'BRL' }}</p>
            </div>
            <div class="kpi">
              <p class="rotulo">Sobra de empenho</p>
              <p class="valor">{{ r.sobraEmpenho | currency: 'BRL' }}</p>
            </div>
            <div class="kpi">
              <p class="rotulo">Sobra aproveitável</p>
              <p class="valor">{{ r.sobraAproveitavel | currency: 'BRL' }}</p>
            </div>
          </div>
        }

        <h3>Lançar execução mensal</h3>
        <form class="grade-form" (ngSubmit)="criarExecucao()">
          <div class="campo">
            <label>Mês</label>
            <input type="date" name="mes" [(ngModel)]="novaExecucao.mesReferencia" required />
          </div>
          <div class="campo">
            <label>Tipo</label>
            <select name="tipo" [(ngModel)]="novaExecucao.tipo" required>
              <option value="EXECUTADO">Executado</option>
              <option value="PREVISAO">Previsão</option>
            </select>
          </div>
          <div class="campo">
            <label>Valor</label>
            <input type="number" name="valor" [(ngModel)]="novaExecucao.valor" required />
          </div>
          <button class="btn-pilula btn-pilula--laranja" type="submit">Lançar</button>
        </form>

        <table class="tabela">
          <thead>
            <tr>
              <th>Mês</th>
              <th>Tipo</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            @for (e of execucoes(); track e.id) {
              <tr>
                <td>{{ e.mesReferencia }}</td>
                <td>{{ e.tipo }}</td>
                <td>{{ e.valor | currency: 'BRL' }}</td>
              </tr>
            }
            @empty {
              <tr>
                <td colspan="3">Nenhum lançamento ainda.</td>
              </tr>
            }
          </tbody>
        </table>
      </section>
    }
  `,
  styles: [
    `
      .subtitulo {
        color: #7a6d6a;
        margin-bottom: 1.5rem;
      }

      .grade-form {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 1rem;
        align-items: end;
      }

      .campo-checkbox label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        color: var(--texto-escuro);
      }

      .tabela-secao,
      .resumo-secao {
        margin-top: 2rem;
        overflow-x: auto;
      }

      .resumo-secao h3 {
        margin-top: 1.75rem;
      }
    `
  ]
})
export class PrevisoesComponent implements OnInit {
  contratos = signal<ContratoPrevisao[]>([]);
  contratoSelecionado = signal<ContratoPrevisao | null>(null);
  resumo = signal<ContratoPrevisaoResumo | null>(null);
  execucoes = signal<ExecucaoMensal[]>([]);

  novo: Partial<ContratoPrevisao> = {};
  novaExecucao: Partial<ExecucaoMensal> = { tipo: 'EXECUTADO' };

  constructor(private service: PrevisoesService) {}

  ngOnInit(): void {
    this.carregarContratos();
  }

  carregarContratos(): void {
    this.service.listarContratos().subscribe((lista) => this.contratos.set(lista));
  }

  criarContrato(): void {
    this.service.criarContrato(this.novo as ContratoPrevisao).subscribe(() => {
      this.novo = {};
      this.carregarContratos();
    });
  }

  verResumo(contrato: ContratoPrevisao): void {
    this.contratoSelecionado.set(contrato);
    this.service.resumoContrato(contrato.id!).subscribe((r) => this.resumo.set(r));
    this.service.listarExecucoes(contrato.id!).subscribe((lista) => this.execucoes.set(lista));
  }

  criarExecucao(): void {
    const sel = this.contratoSelecionado();
    if (!sel) {
      return;
    }
    const execucao: ExecucaoMensal = {
      ...(this.novaExecucao as ExecucaoMensal),
      contratoPrevisao: { id: sel.id! }
    };
    this.service.criarExecucao(execucao).subscribe(() => {
      this.novaExecucao = { tipo: 'EXECUTADO' };
      this.verResumo(sel);
    });
  }
}
