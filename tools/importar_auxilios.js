/*
Importa a planilha AUXILIOS_PAGAMENTOS para a pagina "Controle Financeiro Bolsas e Auxilios",
enviando cada lancamento pela API do pagamentos-service (nao precisa de acesso ao banco).
A planilha contem nomes de discentes: ela e passada por parametro e nao deve entrar no repositorio.

Conferir a planilha sem gravar nada (lista os lancamentos com valores incoerentes):
  node tools/importar_auxilios.js "C:\caminho\planilha.xlsx" --simular

Importar com uma conta ADMIN (recusa rodar se a tabela ja tiver dados, para nao duplicar):
  RU_EMAIL=... RU_SENHA=... node tools/importar_auxilios.js "C:\caminho\planilha.xlsx"

Por padrao usa o gateway local. Para outro ambiente, defina RU_AUTH_URL e RU_PAGAMENTOS_URL
(ex: https://ru-custos-auth.onrender.com/api/auth e https://ru-custos-pagamentos.onrender.com/api/pagamentos).
*/
const { dataExcel, lerAbas, numero, texto } = require('./xlsx');

const AUTH_URL = process.env.RU_AUTH_URL || 'http://localhost:8080/api/auth';
const PAGAMENTOS_URL = process.env.RU_PAGAMENTOS_URL || 'http://localhost:8080/api/pagamentos';

function setorDaAba(nome) {
  if (nome.includes('DACES')) return 'DACES';
  return nome.includes('DAE') ? 'DAE' : null;
}

function paraLancamentos(aba) {
  const lancamentos = [];
  for (const [linha, c] of aba.linhas) {
    // So e lancamento a linha com auxilio e periodo; o resto da aba e rascunho/formula arrastada.
    if (linha === 1 || typeof c.C !== 'string' || typeof c.K !== 'number') continue;
    const periodo = dataExcel(c.K);
    const discentes = numero(c.D);
    lancamentos.push({
      linha,
      corpo: {
        setor: setorDaAba(aba.nome),
        ano: periodo.getUTCFullYear(),
        mes: periodo.getUTCMonth() + 1,
        dataAbertura: typeof c.A === 'number' ? dataExcel(c.A).toISOString().slice(0, 10) : null,
        numeroProcesso: texto(c.B),
        nomeAuxilio: texto(c.C),
        discentes: discentes === null ? null : Math.round(discentes),
        valorUnitario: numero(c.E),
        empenho1: texto(c.F),
        valorEmpenho1: numero(c.G),
        empenho2: texto(c.H),
        valorEmpenho2: numero(c.I),
        valorTotal: numero(c.J),
        // Na aba de 2025 a coluna L guarda observacoes e a M o status do pagamento.
        observacao: [texto(c.L), texto(c.M)].filter(Boolean).join(' - ') || null
      }
    });
  }
  return lancamentos;
}

const reais = (valor) => valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function conferir(aba, lancamentos) {
  const total = lancamentos.reduce((soma, l) => soma + (l.corpo.valorTotal || 0), 0);
  console.log(`\n${aba.nome}: ${lancamentos.length} lançamentos, total R$ ${reais(total)}`);
  for (const { linha, corpo: l } of lancamentos) {
    const avisos = [];
    const soma = (l.valorEmpenho1 || 0) + (l.valorEmpenho2 || 0);
    if (l.valorTotal !== null && Math.abs(soma - l.valorTotal) > 0.005) {
      avisos.push(`empenhos somam ${reais(soma)} e o total é ${reais(l.valorTotal)}`);
    }
    if (l.discentes !== null && l.valorUnitario !== null && l.valorTotal !== null) {
      const esperado = l.discentes * l.valorUnitario;
      if (Math.abs(esperado - l.valorTotal) > 0.005) {
        avisos.push(`${l.discentes} × ${reais(l.valorUnitario)} = ${reais(esperado)} e o total é ${reais(l.valorTotal)}`);
      }
    }
    const anoAbertura = l.dataAbertura && +l.dataAbertura.slice(0, 4);
    const anoProcesso = +(l.numeroProcesso?.match(/\/(\d{4})-/) || [])[1];
    if (anoAbertura && anoProcesso && anoAbertura !== anoProcesso) {
      avisos.push(`abertura em ${l.dataAbertura}, processo de ${anoProcesso}`);
    }
    if (avisos.length) console.log(`  linha ${linha} (${l.nomeAuxilio}, ${l.mes}/${l.ano}): ${avisos.join('; ')}`);
  }
}

async function requisitar(url, opcoes) {
  const resposta = await fetch(url, opcoes);
  if (!resposta.ok) throw new Error(`${opcoes?.method || 'GET'} ${url}: HTTP ${resposta.status} ${await resposta.text()}`);
  return resposta.json();
}

async function principal() {
  const [caminho, opcao] = process.argv.slice(2);
  if (!caminho) throw new Error('informe o caminho da planilha');

  const abas = lerAbas(caminho).map((aba) => ({ aba, lancamentos: paraLancamentos(aba) }));
  abas.forEach(({ aba, lancamentos }) => conferir(aba, lancamentos));
  if (opcao === '--simular') return;

  const { RU_EMAIL: email, RU_SENHA: senha } = process.env;
  if (!email || !senha) throw new Error('defina RU_EMAIL e RU_SENHA');
  const { token } = await requisitar(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  });
  const cabecalhos = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const existentes = await requisitar(`${PAGAMENTOS_URL}/auxilios`, { headers: cabecalhos });
  if (existentes.length) throw new Error(`a tabela já tem ${existentes.length} lançamentos; nada foi importado`);

  let enviados = 0;
  for (const { lancamentos } of abas) {
    for (const { corpo } of lancamentos) {
      await requisitar(`${PAGAMENTOS_URL}/auxilios`, {
        method: 'POST',
        headers: cabecalhos,
        body: JSON.stringify(corpo)
      });
      enviados++;
    }
  }
  console.log(`\n${enviados} lançamentos importados.`);
}

principal().catch((erro) => {
  console.error(`Erro: ${erro.message}`);
  process.exit(1);
});
