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
const fs = require('fs');
const zlib = require('zlib');

const AUTH_URL = process.env.RU_AUTH_URL || 'http://localhost:8080/api/auth';
const PAGAMENTOS_URL = process.env.RU_PAGAMENTOS_URL || 'http://localhost:8080/api/pagamentos';

function lerZip(caminho) {
  const zip = fs.readFileSync(caminho);
  const arquivos = {};
  let fim = zip.length - 22;
  while (zip.readUInt32LE(fim) !== 0x06054b50) fim--;
  let pos = zip.readUInt32LE(fim + 16);
  for (let i = zip.readUInt16LE(fim + 10); i > 0; i--) {
    const metodo = zip.readUInt16LE(pos + 10);
    const tamanho = zip.readUInt32LE(pos + 20);
    const tamNome = zip.readUInt16LE(pos + 28);
    const tamExtra = zip.readUInt16LE(pos + 30);
    const tamComentario = zip.readUInt16LE(pos + 32);
    const local = zip.readUInt32LE(pos + 42);
    const nome = zip.toString('utf8', pos + 46, pos + 46 + tamNome);
    const inicio = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
    const dados = zip.subarray(inicio, inicio + tamanho);
    arquivos[nome] = metodo === 0 ? dados : zlib.inflateRawSync(dados);
    pos += 46 + tamNome + tamExtra + tamComentario;
  }
  return arquivos;
}

const decodificar = (texto) =>
  texto
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n))
    .replace(/&amp;/g, '&');

const colunaParaNumero = (coluna) => [...coluna].reduce((n, letra) => n * 26 + letra.charCodeAt(0) - 64, 0);

function lerAbas(caminho) {
  const zip = lerZip(caminho);
  const texto = (nome) => zip[nome].toString('utf8');
  const compartilhadas = [...texto('xl/sharedStrings.xml').matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) =>
    decodificar(
      [...m[1].replace(/<rPh[\s\S]*?<\/rPh>/g, '').matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join('')
    )
  );
  const relacoes = Object.fromEntries(
    [...texto('xl/_rels/workbook.xml.rels').matchAll(/<Relationship [^>]*>/g)].map((m) => [
      m[0].match(/Id="([^"]+)"/)[1],
      m[0].match(/Target="([^"]+)"/)[1]
    ])
  );

  return [...texto('xl/workbook.xml').matchAll(/<sheet [^>]*>/g)].map((m) => {
    const nome = decodificar(m[0].match(/name="([^"]+)"/)[1]);
    const xml = texto(`xl/${relacoes[m[0].match(/r:id="([^"]+)"/)[1]].replace(/^\/?xl\//, '')}`);
    const linhas = new Map();
    for (const linha of xml.matchAll(/<row ([^>]*?)(?:\/>|>([\s\S]*?)<\/row>)/g)) {
      const valores = {};
      for (const celula of (linha[2] || '').matchAll(/<c ([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
        const coluna = celula[1].match(/r="([A-Z]+)/)[1];
        const tipo = (celula[1].match(/t="(\w+)"/) || [])[1];
        const bruto = ((celula[2] || '').match(/<v>([\s\S]*?)<\/v>/) || [])[1];
        if (bruto === undefined) continue;
        valores[coluna] = tipo === 's' ? compartilhadas[+bruto] : tipo ? decodificar(bruto) : +bruto;
      }
      linhas.set(+linha[1].match(/r="(\d+)"/)[1], valores);
    }

    // Celula mesclada so guarda o valor na primeira linha; repete nas demais.
    for (const mescla of xml.matchAll(/<mergeCell ref="([A-Z]+)(\d+):([A-Z]+)(\d+)"/g)) {
      const [, coluna, de, , ate] = mescla;
      for (let n = +de + 1; n <= +ate; n++) {
        if (linhas.has(n)) linhas.get(n)[coluna] = linhas.get(+de)[coluna];
      }
    }
    return { nome, linhas };
  });
}

function texto(valor) {
  if (valor === undefined) return null;
  const limpo = String(valor).replace(/\s+/g, ' ').trim();
  return limpo === '' || limpo === '-' ? null : limpo;
}

// Aceita numero, "R$ 1.050,00" e "622.00"; "-" e "variável" viram vazio.
function numero(valor) {
  if (typeof valor === 'number') return Math.round(valor * 100) / 100;
  const limpo = texto(valor);
  if (limpo === null) return null;
  const semMoeda = limpo.replace(/[R$\s]/g, '');
  const convertido = Number(semMoeda.includes(',') ? semMoeda.replace(/\./g, '').replace(',', '.') : semMoeda);
  return Number.isNaN(convertido) ? null : convertido;
}

const dataExcel = (serial) => new Date(Date.UTC(1899, 11, 30) + serial * 864e5);

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
