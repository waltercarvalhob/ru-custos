/*
Atualiza o sistema com a planilha Saldo_Real_RU (controle do restaurante), substituindo pela API:
  - pagamentos do RU         (aba " pagamentos RU 2026")  -> Controle Financeiro RU
  - contratos e empenhos     (aba "RU_Contratos")         -> Resumo Executivo / Inicio
  - previsoes mensais        (aba "Previsões 2026")       -> Inicio
  - planos e acoes do SIOP   (aba "SIOP")                 -> SIOP
e preenche o valor de cada empenho do Controle Orcamentario RU com a coluna "Empenhado" das previsoes.

Conferir a planilha sem gravar nada:
  node tools/importar_saldo_real.js "C:\caminho\planilha.xlsx" --simular

Substituir os dados (precisa de conta ADMIN; antes de apagar, salva uma copia do que existe):
  RU_EMAIL=... RU_SENHA=... node tools/importar_saldo_real.js "C:\caminho\planilha.xlsx" --confirmar

Por padrao usa o gateway local. Para o Render, defina RU_AUTH_URL, RU_PAGAMENTOS_URL,
RU_CONTRATOS_URL, RU_PREVISOES_URL e RU_SIOP_URL (ex: https://ru-custos-auth.onrender.com/api/auth).
*/
const fs = require('fs');
const path = require('path');
const { dataExcel, lerAbas, numero, texto } = require('./xlsx');

const LOCAL = 'http://localhost:8080/api';
const URL = {
  auth: process.env.RU_AUTH_URL || `${LOCAL}/auth`,
  pagamentos: process.env.RU_PAGAMENTOS_URL || `${LOCAL}/pagamentos`,
  contratos: process.env.RU_CONTRATOS_URL || `${LOCAL}/contratos`,
  previsoes: process.env.RU_PREVISOES_URL || `${LOCAL}/previsoes`,
  siop: process.env.RU_SIOP_URL || `${LOCAL}/siop`
};

const MESES = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const MESES_NOME = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const semAcento = (t) => String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const reais = (v) => (v ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const somar = (valores) => valores.reduce((s, v) => s + Math.round((v ?? 0) * 100), 0) / 100;
const iso = (d) => d.toISOString().slice(0, 10);
const problemas = [];

function aba(abas, nome) {
  const encontrada = abas.find((a) => semAcento(a.nome) === semAcento(nome));
  if (!encontrada) throw new Error(`a planilha não tem a aba "${nome}"`);
  return encontrada;
}

// Mapa {nome do cabecalho normalizado -> coluna}, para nao depender da posicao das colunas.
function colunas(linha) {
  return Object.fromEntries(Object.entries(linha).map(([col, v]) => [semAcento(v), col]));
}

function coluna(cab, ...nomes) {
  for (const n of nomes) {
    const achada = Object.keys(cab).find((k) => k.startsWith(semAcento(n)));
    if (achada) return cab[achada];
  }
  throw new Error(`coluna não encontrada: ${nomes.join(' / ')}`);
}

// Linhas de rodape ("TOTAL", "Fonte: ...") e vazias nao sao dados.
function linhaValida(valor) {
  const t = texto(valor);
  if (!t) return false;
  const n = semAcento(t);
  return !(n === 'total' || n === 'total geral' || n.startsWith('fonte') || n.startsWith('◀'));
}

// "dd/mm/aaaa" no inicio do texto, ou numero de serie do Excel.
function data(valor) {
  if (typeof valor === 'number') return iso(dataExcel(valor));
  const m = String(valor ?? '').trim().match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

// --- leitura das abas -------------------------------------------------------------------------

function lerPagamentosRu(abas) {
  const a = aba(abas, ' pagamentos RU 2026');
  const ano = +(a.nome.match(/(\d{4})/) || [])[1];
  const cab = colunas(a.linhas.get(2));
  const c = {
    campus: coluna(cab, 'campus'), mes: coluna(cab, 'mes de referencia'), empresa: coluna(cab, 'empresa'),
    contrato: coluna(cab, 'no contrato', 'nº contrato'), processoContratacao: coluna(cab, 'no processo contratacao', 'nº processo contratacao'),
    modalidade: coluna(cab, 'modalidade'), processoPagamento: coluna(cab, 'no processo de pagamento', 'nº processo de pagamento'),
    recurso: coluna(cab, 'recurso'), ne: coluna(cab, 'ne'), valorNe: coluna(cab, 'valor ne'), nf: coluna(cab, 'nf'),
    valorNf: coluna(cab, 'valor nf'), glosa: coluna(cab, 'glosa'), pago: coluna(cab, 'valor pago'), obs: coluna(cab, 'observacao')
  };
  const lista = [];
  for (const [n, l] of a.linhas) {
    if (n <= 2) continue;
    if (!linhaValida(l[c.campus])) {
      if (Object.keys(l).length > 2) problemas.push(`pagamentos RU, linha ${n}: sem campus, ignorada`);
      continue;
    }
    // "Junho (15 a 30)" vira mes "Junho" e o periodo vai para a observacao.
    const mesTexto = texto(l[c.mes]) ?? '';
    const indice = MESES.findIndex((m) => semAcento(mesTexto).startsWith(m));
    const resto = indice >= 0 ? mesTexto.slice(MESES[indice].length).trim() : '';
    const pagoTexto = texto(l[c.pago]);
    const valorPago = numero(l[c.pago]);
    const obs = [resto, texto(l[c.obs]), valorPago === null && pagoTexto ? pagoTexto : null].filter(Boolean).join(' - ') || null;
    if (indice < 0) problemas.push(`pagamentos RU, linha ${n}: mês "${mesTexto}" não reconhecido`);
    if (valorPago === null && !pagoTexto) problemas.push(`pagamentos RU, linha ${n}: sem valor pago`);
    lista.push({
      linha: n,
      corpo: {
        campus: texto(l[c.campus]), mesReferencia: indice >= 0 ? MESES_NOME[indice] : mesTexto, ano,
        empresa: texto(l[c.empresa]), numeroContrato: texto(l[c.contrato]),
        numeroProcessoContratacao: texto(l[c.processoContratacao]), modalidade: texto(l[c.modalidade]),
        numeroProcessoPagamento: texto(l[c.processoPagamento]), recurso: texto(l[c.recurso]), ne: texto(l[c.ne]),
        valorNe: numero(l[c.valorNe]), numeroNf: texto(l[c.nf]), valorNf: numero(l[c.valorNf]),
        glosa: numero(l[c.glosa]), valorPago, observacao: obs
      }
    });
  }
  return lista;
}

function lerContratos(abas) {
  const a = aba(abas, 'RU_Contratos');
  const cab = colunas(a.linhas.get(2));
  const c = {
    campus: coluna(cab, 'campus'), empresa: coluna(cab, 'empresa'), contrato: coluna(cab, 'contrato'),
    processo: coluna(cab, 'processo de contratacao'), valor: coluna(cab, 'valor contratual'),
    utilizado: coluna(cab, 'valor utilizado'), saldo: coluna(cab, 'saldo'), vigencia: coluna(cab, 'vigencia final'),
    ne: coluna(cab, 'no ne', 'nº ne'), saldoNe: coluna(cab, 'saldo do empenho')
  };
  const lista = [];
  for (const [n, l] of a.linhas) {
    if (n <= 2 || !linhaValida(l[c.campus])) continue;
    const vigencia = data(l[c.vigencia]);
    const ne = texto(l[c.ne]);
    lista.push({
      campus: texto(l[c.campus]),
      contrato: {
        empresa: texto(l[c.empresa]), numeroContrato: texto(l[c.contrato]), processoContratacao: texto(l[c.processo]),
        valorContratual: numero(l[c.valor]), valorUtilizado: numero(l[c.utilizado]), saldo: numero(l[c.saldo]),
        vigenciaFim: vigencia, status: vigencia ? null : texto(l[c.vigencia])
      },
      empenho: ne || numero(l[c.saldoNe]) !== null
        ? { numeroNe: ne, saldoEmpenho: numero(l[c.saldoNe]), ano: +((ne || '').match(/^(\d{4})/) || [])[1] || null }
        : null
    });
  }
  return lista;
}

function lerPrevisoes(abas) {
  const a = aba(abas, 'Previsões 2026');
  const nCab = [...a.linhas].find(([, l]) => Object.values(l).some((v) => semAcento(v) === 'favorecido'))[0];
  const cab = colunas(a.linhas.get(nCab));
  const tipos = a.linhas.get(nCab + 1);
  const c = {
    favorecido: coluna(cab, 'favorecido'), contrato: coluna(cab, 'no do contrato', 'nº do contrato'),
    vigencia: coluna(cab, 'vigencia'), plano: coluna(cab, 'plano interno'), setor: coluna(cab, 'setor sipac'),
    objeto: coluna(cab, 'objeto'), empenhado: coluna(cab, 'empenhado'), ne: coluna(cab, 'no ne', 'nº ne'),
    valor: coluna(cab, 'valor do contrato'), processo: coluna(cab, 'processo sei'), sobra: coluna(cab, 'sobra aproveitavel?')
  };
  const termino = String.fromCharCode(c.vigencia.charCodeAt(0) + 1);
  // Colunas de mes: cabecalho com data; a linha de baixo diz se e "Executado" ou "Previsão".
  const meses = Object.entries(a.linhas.get(nCab))
    .filter(([, v]) => typeof v === 'number')
    .map(([col, v]) => ({ col, mes: iso(dataExcel(v)), tipo: semAcento(tipos[col] ?? '').startsWith('executado') ? 'EXECUTADO' : 'PREVISAO' }));
  const lista = [];
  for (const [n, l] of a.linhas) {
    if (n <= nCab + 1 || !linhaValida(l[c.favorecido])) continue;
    const execucoes = [];
    for (const m of meses) {
      const valor = numero(l[m.col]);
      if (valor === null) {
        if (texto(l[m.col])) problemas.push(`previsões, linha ${n}, ${m.mes}: valor "${l[m.col]}" não é número`);
        continue;
      }
      execucoes.push({ mesReferencia: m.mes, tipo: m.tipo, valor });
    }
    lista.push({
      linha: n,
      contrato: {
        favorecido: texto(l[c.favorecido]), numeroContrato: texto(l[c.contrato]),
        vigenciaInicio: data(l[c.vigencia]), vigenciaFim: data(l[termino]), planoInterno: texto(l[c.plano]),
        setorSipac: texto(l[c.setor]), objeto: texto(l[c.objeto]), valorContrato: numero(l[c.valor]) ?? 0,
        numeroNe: texto(l[c.ne]), empenhado: numero(l[c.empenhado]) ?? 0, processoSei: texto(l[c.processo]),
        sobraAproveitavel: semAcento(l[c.sobra] ?? '') === 's'
      },
      execucoes
    });
  }
  return lista;
}

function lerSiop(abas) {
  const a = aba(abas, 'SIOP');
  const linhas = [...a.linhas];
  const planos = [];
  for (const [n, l] of linhas) {
    if (n < 3) continue;
    if (!linhaValida(l.B)) break;
    planos.push({
      localizador: texto(l.A), planoOrcamentario: texto(l.B), projetoLei: numero(l.C) ?? 0,
      dotacaoInicial: numero(l.D) ?? 0, dotacaoAtual: numero(l.E) ?? 0, empenhado: numero(l.F) ?? 0,
      liquidado: numero(l.G) ?? 0, pago: numero(l.H) ?? 0
    });
  }
  // Dois quadros com o mesmo cabecalho: o primeiro e de custeio, o segundo de capital.
  const quadros = linhas.filter(([, l]) => semAcento(l.C ?? '') === 'dotacao ploa custeio').map(([n]) => n);
  const acoes = [];
  quadros.forEach((inicio, i) => {
    let acao = null;
    for (const [n, l] of linhas) {
      if (n <= inicio) continue;
      if (!linhaValida(l.A ?? l.B) || !linhaValida(l.B)) break;
      acao = texto(l.A) ?? acao;
      const v = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map((col) => numero(l[col]) ?? 0);
      acoes.push({
        acao: acao ?? '4002 - Assistência ao Estudante de Ensino Superior', discriminacao: texto(l.B),
        tipo: i === 0 ? 'CUSTEIO' : 'CAPITAL', dotacaoPloaCusteio: v[0], dotacaoAnuladaPloa: v[1],
        dotacaoInicialLoaCusteio: v[2], recomposicaoPloa: v[3], dotacaoAutorizada: v[4], remanejadoCancelado: v[5],
        creditoSuplementar: v[6], dotacaoAtualizada: v[7], executado: v[8], saldoAtualizar: v[9], atualizadoEm: iso(new Date())
      });
    }
  });
  return { planos, acoes };
}

// Valor do empenho no Controle Orcamentario RU: coluna "Empenhado" das previsoes, quando a linha tem um so NE.
function empenhosRu(previsoes) {
  const lista = [];
  for (const p of previsoes) {
    const nes = (p.contrato.numeroNe ?? '').match(/\d{4}\s*NE\s*\d+/gi) ?? [];
    if (nes.length !== 1) {
      if (nes.length > 1) problemas.push(`previsões, linha ${p.linha}: ${nes.length} empenhos na mesma célula (${p.contrato.numeroNe}); informe o valor de cada um na tela`);
      continue;
    }
    lista.push({ setor: 'RU', numero: nes[0].replace(/\s+/g, ''), ano: +nes[0].slice(0, 4), numeroContrato: p.contrato.numeroContrato, valor: p.contrato.empenhado });
  }
  return lista;
}

// --- API -----------------------------------------------------------------------------------------

let cabecalhos = { 'Content-Type': 'application/json' };

// Repete quando o servico do Render ainda esta acordando (rede ou 502/503/504).
async function chamar(metodo, url, corpo) {
  for (let tentativa = 1; ; tentativa++) {
    let resposta;
    try {
      resposta = await fetch(url, { method: metodo, headers: cabecalhos, body: corpo === undefined ? undefined : JSON.stringify(corpo) });
    } catch (erro) {
      if (tentativa < 4) { await new Promise((r) => setTimeout(r, 20000)); continue; }
      throw new Error(`${metodo} ${url}: ${erro.message}`);
    }
    if ([502, 503, 504].includes(resposta.status) && tentativa < 4) { await new Promise((r) => setTimeout(r, 20000)); continue; }
    if (!resposta.ok) throw new Error(`${metodo} ${url}: HTTP ${resposta.status} ${await resposta.text()}`);
    const t = await resposta.text();
    return t ? JSON.parse(t) : null;
  }
}

async function apagarTodos(rotulo, url, lista) {
  for (const item of lista) await chamar('DELETE', `${url}/${item.id}`);
  console.log(`  ${rotulo}: ${lista.length} removidos`);
}

async function principal() {
  const [caminho, opcao] = process.argv.slice(2);
  if (!caminho || !['--simular', '--confirmar'].includes(opcao)) {
    throw new Error('uso: node tools/importar_saldo_real.js <planilha.xlsx> --simular | --confirmar');
  }
  const abas = lerAbas(caminho);
  const pagamentos = lerPagamentosRu(abas);
  const contratos = lerContratos(abas);
  const previsoes = lerPrevisoes(abas);
  const siop = lerSiop(abas);
  const empenhos = empenhosRu(previsoes);

  const executado = somar(previsoes.flatMap((p) => p.execucoes.filter((e) => e.tipo === 'EXECUTADO').map((e) => e.valor)));
  console.log('Planilha:');
  console.log(`  pagamentos RU: ${pagamentos.length} lançamentos, valor pago R$ ${reais(somar(pagamentos.map((p) => p.corpo.valorPago)))}`);
  console.log(`  contratos: ${contratos.length}, valor contratual R$ ${reais(somar(contratos.map((c) => c.contrato.valorContratual)))}, ${contratos.filter((c) => c.empenho).length} empenhos`);
  console.log(`  previsões: ${previsoes.length} contratos, ${previsoes.reduce((s, p) => s + p.execucoes.length, 0)} meses, executado R$ ${reais(executado)}`);
  console.log(`  SIOP: ${siop.planos.length} planos (dotação atual R$ ${reais(somar(siop.planos.map((p) => p.dotacaoAtual)))}), ${siop.acoes.length} ações`);
  console.log(`  valor de empenho para o Controle Orçamentário RU: ${empenhos.length} empenhos`);
  if (problemas.length) {
    console.log('\nPontos de atenção:');
    problemas.forEach((p) => console.log(`  - ${p}`));
  }
  if (opcao === '--simular') return;

  const { RU_EMAIL: email, RU_SENHA: senha } = process.env;
  if (!email || !senha) throw new Error('defina RU_EMAIL e RU_SENHA');
  const { token, usuario } = await chamar('POST', `${URL.auth}/login`, { email, senha });
  if (usuario.perfil !== 'ADMIN') throw new Error('a conta precisa ser ADMIN; nada foi alterado');
  cabecalhos = { ...cabecalhos, Authorization: `Bearer ${token}` };

  console.log('\nLendo os dados atuais...');
  const atual = {
    pagamentosRu: await chamar('GET', URL.pagamentos),
    empenhosRu: await chamar('GET', `${URL.pagamentos}/empenhos?setor=RU`),
    contratosEmpenhos: await chamar('GET', `${URL.contratos}/empenhos`),
    contratos: await chamar('GET', URL.contratos),
    campus: await chamar('GET', `${URL.contratos}/campus`),
    execucoes: await chamar('GET', `${URL.previsoes}/execucoes`),
    previsoes: await chamar('GET', `${URL.previsoes}/contratos`),
    planosSiop: await chamar('GET', `${URL.siop}/planos-orcamentarios`),
    acoesSiop: await chamar('GET', `${URL.siop}/acoes-orcamentarias`)
  };
  const copia = path.join(path.dirname(path.resolve(caminho)), `copia_dados_RU_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(copia, JSON.stringify(atual, null, 1));
  console.log(`Cópia dos dados atuais salva em ${copia}`);

  console.log('\nPagamentos RU:');
  await apagarTodos('lançamentos antigos', URL.pagamentos, atual.pagamentosRu);
  for (const p of pagamentos) await chamar('POST', URL.pagamentos, p.corpo);
  console.log(`  ${pagamentos.length} lançamentos gravados`);

  console.log('Contratos:');
  await apagarTodos('empenhos antigos', `${URL.contratos}/empenhos`, atual.contratosEmpenhos);
  await apagarTodos('contratos antigos', URL.contratos, atual.contratos);
  await apagarTodos('campus antigos', `${URL.contratos}/campus`, atual.campus);
  const campusIds = new Map();
  for (const c of contratos) {
    if (!campusIds.has(c.campus)) campusIds.set(c.campus, (await chamar('POST', `${URL.contratos}/campus`, { nome: c.campus })).id);
    const novo = await chamar('POST', URL.contratos, { ...c.contrato, campus: { id: campusIds.get(c.campus) } });
    if (c.empenho) await chamar('POST', `${URL.contratos}/empenhos`, { ...c.empenho, contrato: { id: novo.id } });
  }
  console.log(`  ${campusIds.size} campus e ${contratos.length} contratos gravados`);

  console.log('Previsões:');
  await apagarTodos('meses antigos', `${URL.previsoes}/execucoes`, atual.execucoes);
  await apagarTodos('contratos de previsão antigos', `${URL.previsoes}/contratos`, atual.previsoes);
  for (const p of previsoes) {
    const novo = await chamar('POST', `${URL.previsoes}/contratos`, p.contrato);
    for (const e of p.execucoes) await chamar('POST', `${URL.previsoes}/execucoes`, { ...e, contratoPrevisao: { id: novo.id } });
  }
  console.log(`  ${previsoes.length} contratos de previsão gravados`);

  console.log('SIOP:');
  await apagarTodos('planos antigos', `${URL.siop}/planos-orcamentarios`, atual.planosSiop);
  await apagarTodos('ações antigas', `${URL.siop}/acoes-orcamentarias`, atual.acoesSiop);
  for (const p of siop.planos) await chamar('POST', `${URL.siop}/planos-orcamentarios`, p);
  for (const a of siop.acoes) await chamar('POST', `${URL.siop}/acoes-orcamentarias`, a);
  console.log(`  ${siop.planos.length} planos e ${siop.acoes.length} ações gravados`);

  console.log('Controle Orçamentário RU:');
  const chave = (n) => n.replace(/\s+/g, '').toUpperCase();
  const existentes = new Map(atual.empenhosRu.filter((e) => e.id !== null).map((e) => [chave(e.numero), e.id]));
  for (const e of empenhos) {
    const id = existentes.get(chave(e.numero));
    await chamar(id ? 'PUT' : 'POST', id ? `${URL.pagamentos}/empenhos/${id}` : `${URL.pagamentos}/empenhos`, e);
  }
  console.log(`  valor de ${empenhos.length} empenhos atualizado`);
  console.log('\nAtualização concluída.');
}

principal().catch((erro) => {
  console.error(`\nErro: ${erro.message}`);
  process.exit(1);
});
