import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AcaoOrcamentaria, PlanoOrcamentario, SiopService } from './siop.service';

@Component({
  selector: 'app-siop',
  standalone: true,
  imports: [CurrencyPipe, FormsModule],
  template: `
    <h1>SIOP</h1>
    <p class="subtitulo">Execução orçamentária — Sistema Integrado de Planejamento e Orçamento</p>

    <section class="cartao">
      <h2>Planos orçamentários</h2>
      <table class="tabela">
        <thead>
          <tr>
            <th>Localizador</th>
            <th>Plano orçamentário</th>
            <th>Dotação inicial</th>
            <th>Dotação atual</th>
            <th>Empenhado</th>
            <th>Liquidado</th>
            <th>Pago</th>
          </tr>
        </thead>
        <tbody>
          @for (p of planos(); track p.id) {
            <tr>
              <td>{{ p.localizador }}</td>
              <td>{{ p.planoOrcamentario }}</td>
              <td>{{ p.dotacaoInicial | currency: 'BRL' }}</td>
              <td>{{ p.dotacaoAtual | currency: 'BRL' }}</td>
              <td>{{ p.empenhado | currency: 'BRL' }}</td>
              <td>{{ p.liquidado | currency: 'BRL' }}</td>
              <td>{{ p.pago | currency: 'BRL' }}</td>
            </tr>
          }
          @empty {
            <tr>
              <td colspan="7">Nenhum plano cadastrado ainda.</td>
            </tr>
          }
        </tbody>
      </table>

      <details class="novo-item">
        <summary>Cadastrar plano orçamentário</summary>
        <form class="grade-form" (ngSubmit)="criarPlano()">
          <div class="campo">
            <label>Localizador</label>
            <input name="localizador" [(ngModel)]="novoPlano.localizador" />
          </div>
          <div class="campo">
            <label>Plano orçamentário</label>
            <input name="planoOrcamentario" [(ngModel)]="novoPlano.planoOrcamentario" required />
          </div>
          <div class="campo">
            <label>Projeto de lei</label>
            <input type="number" name="projetoLei" [(ngModel)]="novoPlano.projetoLei" required />
          </div>
          <div class="campo">
            <label>Dotação inicial</label>
            <input type="number" name="dotacaoInicial" [(ngModel)]="novoPlano.dotacaoInicial" required />
          </div>
          <div class="campo">
            <label>Dotação atual</label>
            <input type="number" name="dotacaoAtual" [(ngModel)]="novoPlano.dotacaoAtual" required />
          </div>
          <div class="campo">
            <label>Empenhado</label>
            <input type="number" name="empenhado" [(ngModel)]="novoPlano.empenhado" required />
          </div>
          <div class="campo">
            <label>Liquidado</label>
            <input type="number" name="liquidado" [(ngModel)]="novoPlano.liquidado" required />
          </div>
          <div class="campo">
            <label>Pago</label>
            <input type="number" name="pago" [(ngModel)]="novoPlano.pago" required />
          </div>
          <button class="btn-pilula btn-pilula--laranja" type="submit">Salvar</button>
        </form>
      </details>
    </section>

    <section class="cartao acoes-secao">
      <h2>Ações orçamentárias</h2>
      <table class="tabela">
        <thead>
          <tr>
            <th>Ação</th>
            <th>Discriminação</th>
            <th>Tipo</th>
            <th>Dotação atualizada</th>
            <th>Executado</th>
            <th>Saldo a utilizar</th>
          </tr>
        </thead>
        <tbody>
          @for (a of acoes(); track a.id) {
            <tr>
              <td>{{ a.acao }}</td>
              <td>{{ a.discriminacao }}</td>
              <td>{{ a.tipo }}</td>
              <td>{{ a.dotacaoAtualizada | currency: 'BRL' }}</td>
              <td>{{ a.executado | currency: 'BRL' }}</td>
              <td>{{ a.saldoAtualizar | currency: 'BRL' }}</td>
            </tr>
          }
          @empty {
            <tr>
              <td colspan="6">Nenhuma ação cadastrada ainda.</td>
            </tr>
          }
        </tbody>
      </table>

      <details class="novo-item">
        <summary>Cadastrar ação orçamentária</summary>
        <form class="grade-form" (ngSubmit)="criarAcao()">
          <div class="campo">
            <label>Ação</label>
            <input name="acao" [(ngModel)]="novaAcao.acao" required />
          </div>
          <div class="campo">
            <label>Discriminação</label>
            <input name="discriminacao" [(ngModel)]="novaAcao.discriminacao" required />
          </div>
          <div class="campo">
            <label>Tipo</label>
            <select name="tipo" [(ngModel)]="novaAcao.tipo" required>
              <option value="CUSTEIO">Custeio</option>
              <option value="CAPITAL">Capital</option>
            </select>
          </div>
          <div class="campo">
            <label>Dotação PLOA custeio</label>
            <input type="number" name="dotacaoPloaCusteio" [(ngModel)]="novaAcao.dotacaoPloaCusteio" required />
          </div>
          <div class="campo">
            <label>Dotação anulada PLOA</label>
            <input type="number" name="dotacaoAnuladaPloa" [(ngModel)]="novaAcao.dotacaoAnuladaPloa" required />
          </div>
          <div class="campo">
            <label>Dotação inicial LOA custeio</label>
            <input type="number" name="dotacaoInicialLoaCusteio" [(ngModel)]="novaAcao.dotacaoInicialLoaCusteio" required />
          </div>
          <div class="campo">
            <label>Recomposição PLOA</label>
            <input type="number" name="recomposicaoPloa" [(ngModel)]="novaAcao.recomposicaoPloa" required />
          </div>
          <div class="campo">
            <label>Dotação autorizada</label>
            <input type="number" name="dotacaoAutorizada" [(ngModel)]="novaAcao.dotacaoAutorizada" required />
          </div>
          <div class="campo">
            <label>Remanejado/cancelado</label>
            <input type="number" name="remanejadoCancelado" [(ngModel)]="novaAcao.remanejadoCancelado" required />
          </div>
          <div class="campo">
            <label>Crédito suplementar</label>
            <input type="number" name="creditoSuplementar" [(ngModel)]="novaAcao.creditoSuplementar" required />
          </div>
          <div class="campo">
            <label>Dotação atualizada</label>
            <input type="number" name="dotacaoAtualizada" [(ngModel)]="novaAcao.dotacaoAtualizada" required />
          </div>
          <div class="campo">
            <label>Executado</label>
            <input type="number" name="executado" [(ngModel)]="novaAcao.executado" required />
          </div>
          <div class="campo">
            <label>Saldo a utilizar</label>
            <input type="number" name="saldoAtualizar" [(ngModel)]="novaAcao.saldoAtualizar" required />
          </div>
          <button class="btn-pilula btn-pilula--laranja" type="submit">Salvar</button>
        </form>
      </details>
    </section>
  `,
  styles: [
    `
      .subtitulo {
        color: #7a6d6a;
        margin-bottom: 1.5rem;
      }

      .acoes-secao {
        margin-top: 2rem;
      }

      .novo-item {
        margin-top: 1.25rem;
      }

      .grade-form {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
        align-items: end;
        margin-top: 0.75rem;
      }
    `
  ]
})
export class SiopComponent implements OnInit {
  planos = signal<PlanoOrcamentario[]>([]);
  acoes = signal<AcaoOrcamentaria[]>([]);

  novoPlano: Partial<PlanoOrcamentario> = {};
  novaAcao: Partial<AcaoOrcamentaria> = { tipo: 'CUSTEIO' };

  constructor(private service: SiopService) {}

  ngOnInit(): void {
    this.carregarPlanos();
    this.carregarAcoes();
  }

  carregarPlanos(): void {
    this.service.listarPlanos().subscribe((lista) => this.planos.set(lista));
  }

  carregarAcoes(): void {
    this.service.listarAcoes().subscribe((lista) => this.acoes.set(lista));
  }

  criarPlano(): void {
    this.service.criarPlano(this.novoPlano as PlanoOrcamentario).subscribe(() => {
      this.novoPlano = {};
      this.carregarPlanos();
    });
  }

  criarAcao(): void {
    this.service.criarAcao(this.novaAcao as AcaoOrcamentaria).subscribe(() => {
      this.novaAcao = { tipo: 'CUSTEIO' };
      this.carregarAcoes();
    });
  }
}
