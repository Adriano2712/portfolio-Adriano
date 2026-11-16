/**
 * Fonte única de números e fatos do portfólio.
 *
 * Regras:
 * - Nada aqui é estimado, arredondado ou reescrito. Cada número vem do CV V8
 *   (PDFs de 16/11/2026 e 12/11/2026) ou de um arquivo de repositório citado em `source`.
 * - `cv`: trecho literal do CV (PT e EN). O teste `npm run check:content` confere que o
 *   trecho existe no snapshot do CV em docs/cv/ e que todo dígito exibido aparece no trecho.
 * - `status: 'validar'`: número tirado do repositório, não do CV. Exibido só depois de
 *   confirmado pelo Adriano (o modo --strict bloqueia a publicação enquanto houver algum).
 * - Textos de MDX nunca escrevem números à mão: usam <Fact k="chave" />.
 */

export type Locale = 'pt' | 'en';

export interface Fact {
  pt: string;
  en: string;
  /** De onde o número vem. "cv" ou caminho no repositório. */
  source: string;
  /** Trechos literais do CV, quando source === 'cv'. */
  cv?: { pt: string; en: string };
  status: 'ok' | 'validar';
}

export const CV_VERSION = 'V8';

export const facts = {
  // ---------- AI Sales OS ----------
  'aisales.phases': {
    pt: '25+',
    en: '25+',
    source: 'cv',
    cv: { pt: 'mais de 25 fases validadas', en: 'more than 25 validated phases' },
    status: 'ok',
  },
  'aisales.countries': {
    pt: '8',
    en: '8',
    source: 'AI-sales-OS/README.md#automação-contínua-produção-real',
    status: 'ok',
  },
  'aisales.dailyCost': {
    pt: '~US$ 0,05–0,07/dia',
    en: '~US$ 0.05–0.07/day',
    source: 'AI-sales-OS/README.md#automação-contínua-produção-real',
    status: 'ok',
  },
  'aisales.zeroScoreRows': {
    pt: '11 de 39',
    en: '11 of 39',
    source: 'AI-sales-OS/docs/WEBSITE_ANALYSIS.md#fase-5',
    status: 'ok',
  },

  // ---------- Indexa ----------
  'indexa.oracleMatched': {
    pt: '126 de 129',
    en: '126 of 129',
    source: 'cv',
    cv: { pt: '126 de 129 períodos idênticos', en: '126 of 129 periods identical' },
    status: 'ok',
  },
  'indexa.oracleOff': {
    pt: '3',
    en: '3',
    source: 'cv',
    cv: { pt: 'os 3 restantes com diferença de 0,01 p.p.', en: 'the remaining 3 off by 0.01 p.p.' },
    status: 'ok',
  },
  'indexa.oracleDiff': {
    pt: '0,01 p.p.',
    en: '0.01 p.p.',
    source: 'cv',
    cv: { pt: 'diferença de 0,01 p.p.', en: 'off by 0.01 p.p.' },
    status: 'ok',
  },
  'indexa.tests': {
    pt: '~290',
    en: '~290',
    source: 'cv',
    cv: { pt: 'cerca de 290 testes automatizados', en: 'about 290 automated tests' },
    status: 'ok',
  },
  'indexa.adrs': {
    pt: '15',
    en: '15',
    source: 'cv',
    cv: { pt: '15 decisões de arquitetura (ADRs)', en: '15 architecture decisions (ADRs)' },
    status: 'ok',
  },
  'indexa.parallelRuns': {
    pt: '6 processamentos e 5 envios em paralelo',
    en: '6 parallel processing runs and 5 parallel sends',
    source: 'indexa/README.md#testes; indexa/docs/adr.md#adr-10',
    status: 'ok',
  },
  'indexa.exampleCorrect': {
    pt: 'R$ 2.606,61',
    en: 'R$ 2,606.61',
    source: 'indexa/docs/adr.md#adr-04',
    status: 'ok',
  },
  'indexa.exampleEarlyRounding': {
    pt: 'R$ 2.606,50',
    en: 'R$ 2,606.50',
    source: 'indexa/docs/adr.md#adr-04',
    status: 'ok',
  },
  'indexa.exampleBase': {
    pt: 'R$ 2.500,00',
    en: 'R$ 2,500.00',
    source: 'indexa/README.md#exemplo-conferível',
    status: 'ok',
  },
  'indexa.igpm2025': {
    pt: '−1,04% em 2025',
    en: '−1.04% in 2025',
    source: 'indexa/docs/adr.md#adr-03',
    status: 'ok',
  },
} as const satisfies Record<string, Fact>;

export type FactKey = keyof typeof facts;

export function fact(key: FactKey, locale: Locale): string {
  return facts[key][locale];
}

// ---------- Perfil, trajetória e contato (texto literal do CV V8) ----------

export const profile = {
  name: 'Adriano do Prado Alves',
  role: { pt: 'Desenvolvedor Full Stack Júnior', en: 'Junior Full Stack Developer' },
  headlineStack: ['React', 'TypeScript', 'Python', 'C#/.NET'],
  location: { pt: 'Sorocaba, SP · Remoto (Brasil)', en: 'Sorocaba, SP · Remote (Brazil)' },
  availability: { pt: 'Disponível · Remoto Brasil / Sorocaba', en: 'Available · Remote Brazil / Sorocaba' },
  links: {
    email: 'mailto:adrianopradoalves@gmail.com',
    emailLabel: 'adrianopradoalves@gmail.com',
    linkedin: 'https://linkedin.com/in/adriano-prado-alves',
    github: 'https://github.com/Adriano2712',
  },
  cv: { pt: '/cv/cv-adriano-prado-alves-pt.pdf', en: '/cv/cv-adriano-prado-alves-en.pdf' },
} as const;

export const experience = [
  {
    company: 'OPMOBILITY',
    role: { pt: 'Desenvolvedor Full Stack Júnior', en: 'Junior Full Stack Developer' },
    period: { pt: 'Set/2025 – Set/2026', en: 'Sep/2025 – Sep/2026' },
  },
  {
    company: 'CBA – Companhia Brasileira de Alumínio',
    role: { pt: 'Jovem Aprendiz', en: 'Apprentice (Jovem Aprendiz)' },
    period: { pt: 'Jan/2022 – Dez/2023', en: 'Jan/2022 – Dec/2023' },
  },
] as const;

export const education = [
  {
    course: { pt: 'Bacharelado em Ciência da Computação', en: "Bachelor's in Computer Science" },
    school: 'UNIP',
    period: { pt: 'Jan/2025 – Dez/2028 (em andamento)', en: 'Jan/2025 – Dec/2028 (in progress)' },
  },
  {
    course: {
      pt: 'Tecnólogo em Análise e Desenvolvimento de Sistemas',
      en: 'Technologist in Systems Analysis and Development',
    },
    school: 'ATHON Ensino Superior',
    period: { pt: 'Jan/2022 – Dez/2024 (concluído)', en: 'Jan/2022 – Dec/2024 (completed)' },
  },
  {
    course: { pt: 'Técnico em Eletroeletrônica', en: 'Technical Diploma in Electrical and Electronics' },
    school: 'SENAI',
    period: { pt: 'Jan/2022 – Dez/2023', en: 'Jan/2022 – Dec/2023' },
  },
] as const;

export const certifications = [
  { pt: 'AWS Academy Cloud Foundations', en: 'AWS Academy Cloud Foundations' },
  { pt: 'Oracle Cloud Infrastructure', en: 'Oracle Cloud Infrastructure' },
  { pt: 'Google Cloud Foundations', en: 'Google Cloud Foundations' },
  { pt: 'React.js com TypeScript', en: 'React.js with TypeScript' },
] as const;

// ---------- Repositórios e evidências ----------

export const repos = {
  'ai-sales-os': 'https://github.com/Adriano2712/AI-sales-OS',
  // Público (confirmado em 16/11/2026); o CV V8 não traz o link.
  indexa: 'https://github.com/Adriano2712/indexa',
  noar: 'https://github.com/Adriano2712/noAr',
} as const;

/** Faixa "Engenharia em números": cada item aponta para a evidência. */
export const engineeringMetrics = [
  {
    value: 'indexa.tests',
    label: { pt: 'testes automatizados no Indexa', en: 'automated tests in Indexa' },
    evidence: `${repos.indexa}/tree/main/tests`,
  },
  {
    value: 'indexa.adrs',
    label: { pt: 'ADRs registradas no Indexa', en: 'ADRs recorded in Indexa' },
    evidence: `${repos.indexa}/blob/main/docs/adr.md`,
  },
  {
    value: 'aisales.phases',
    label: { pt: 'fases validadas no AI Sales OS', en: 'validated phases in AI Sales OS' },
    evidence: `${repos['ai-sales-os']}#fases`,
  },
  {
    value: null,
    text: 'CI/CD',
    label: { pt: 'GitHub Actions no Indexa', en: 'GitHub Actions in Indexa' },
    evidence: `${repos.indexa}/actions`,
  },
  {
    value: null,
    text: 'Docker',
    label: { pt: 'deploy com Docker Compose no Indexa', en: 'Docker Compose deployment in Indexa' },
    evidence: `${repos.indexa}/blob/main/docker-compose.yml`,
  },
] as const satisfies ReadonlyArray<{
  value: FactKey | null;
  text?: string;
  label: Record<Locale, string>;
  evidence: string;
}>;
