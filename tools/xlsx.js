// Leitura de planilhas .xlsx sem dependencias externas (o projeto nao usa Python nem pacotes npm em tools/).
const fs = require('fs');
const zlib = require('zlib');

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
  return limpo === '' || limpo === '-' || limpo === '—' ? null : limpo;
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

module.exports = { dataExcel, lerAbas, numero, texto };
