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

export function semAcento(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export function categoriaDoAuxilio(nome: string): string {
  const normalizado = semAcento(nome);
  // Auxilio novo, fora da lista, aparece com o proprio nome em vez de sumir do resumo.
  return CATEGORIAS.find(([padrao]) => padrao.test(normalizado))?.[1] ?? nome;
}
