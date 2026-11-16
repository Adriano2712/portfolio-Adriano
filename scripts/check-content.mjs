#!/usr/bin/env node
/**
 * Verificação de conteúdo da Etapa 1 (roda sem dependências, Node >= 24).
 *
 *   node scripts/check-content.mjs           erros falham; pendências viram aviso
 *   node scripts/check-content.mjs --strict  pendências também falham (usar antes de publicar)
 *
 * Confere:
 *  1. Fatos com source "cv": o trecho literal existe no snapshot do CV e todo dígito exibido aparece no trecho.
 *  2. MDX: nenhum dígito escrito à mão na prosa; números só via <Fact k="..."/>.
 *  3. Toda <Fact k> e todo highlight.fact existem em facts.ts.
 *  4. Paridade PT/EN por projeto: mesmas chaves de fato, mesmos diagramas, mesma galeria.
 *  5. Imagens da galeria existem; diagramas existem em PT e EN.
 *  6. ui.ts tem as mesmas chaves nas duas línguas.
 *  7. Pendências: [PENDENTE], status "validar", status "rascunho".
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const strict = process.argv.includes('--strict');
const { facts, CV_VERSION } = await import(pathToFileURL(join(root, 'src/data/facts.ts')).href);
const { ui } = await import(pathToFileURL(join(root, 'src/i18n/ui.ts')).href);

const errors = [];
const pending = [];
const rel = (p) => relative(root, p).replaceAll('\\', '/');
const norm = (s) => s.replace(/\s+/g, ' ');
const digits = (s) => (s.match(/\d+/g) ?? []);

// Identificadores técnicos que não são métricas do CV. Manter curto e explícito.
const ALLOWED_DIGIT_PATTERNS = [
  /\bADR[- ]\d+\b/g, // ADR-04, ADR 0003
  /\.NET \d+/g, // .NET 8, .NET 10
  /\b12 (meses|months)\b/g, // nome da série "IPCA 12 meses"
  /\b403\b/g, // código HTTP citado no NoAr
];

// ---------- 1. Fatos x CV ----------
const cvText = {
  pt: norm(readFileSync(join(root, `docs/cv/cv-${CV_VERSION.toLowerCase()}-pt.txt`), 'utf8')),
  en: norm(readFileSync(join(root, `docs/cv/cv-${CV_VERSION.toLowerCase()}-en.txt`), 'utf8')),
};
for (const [key, f] of Object.entries(facts)) {
  if (f.status === 'validar') pending.push(`facts.ts: "${key}" vem de ${f.source}, não do CV; confirmar antes de publicar`);
  if (f.source !== 'cv') continue;
  if (!f.cv) { errors.push(`facts.ts: "${key}" tem source "cv" mas não tem trecho do CV`); continue; }
  for (const lang of ['pt', 'en']) {
    if (!cvText[lang].includes(norm(f.cv[lang]))) {
      errors.push(`facts.ts: "${key}" (${lang}) — trecho não encontrado no CV ${CV_VERSION}: "${f.cv[lang]}"`);
    }
    const quoteDigits = new Set(digits(f.cv[lang]));
    for (const d of digits(f[lang])) {
      if (!quoteDigits.has(d)) errors.push(`facts.ts: "${key}" (${lang}) exibe "${d}", que não está no trecho do CV`);
    }
  }
}

// ---------- 2 a 5. MDX ----------
function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

function parseMdx(file) {
  const raw = readFileSync(file, 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) { errors.push(`${rel(file)}: sem frontmatter`); return null; }
  const [, fm, body] = m;
  const factKeys = [...raw.matchAll(/<Fact\s+k="([^"]+)"\s*\/>/g)].map((x) => x[1]);
  const highlight = fm.match(/^\s+fact:\s*(\S+)/m)?.[1];
  if (highlight) factKeys.push(highlight);
  const gallery = [...fm.matchAll(/^\s+- src:\s*(\S+)/gm)].map((x) => x[1]);
  const alts = [...fm.matchAll(/^\s+alt:\s*(.+)$/gm)].map((x) => x[1].trim());
  const diagrams = [...fm.matchAll(/^\s+- id:\s*(\S+)/gm)].map((x) => x[1]);
  const summary = fm.match(/^summary:\s*(.+)$/m)?.[1] ?? '';
  return { raw, fm, body, factKeys, gallery, alts, diagrams, summary };
}

function checkDigits(file, text) {
  let t = text
    .replace(/```[\s\S]*?```/g, '') // blocos de código
    .replace(/`[^`]*`/g, '') // código inline
    .replace(/<Fact\s+k="[^"]+"\s*\/>/g, '')
    .replace(/<[^>]+>/g, '') // outros componentes
    .replace(/\]\([^)]*\)/g, ']') // URLs de links
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\[PENDENTE[^\]]*\]/g, '');
  for (const re of ALLOWED_DIGIT_PATTERNS) t = t.replace(re, '');
  t.split('\n').forEach((line) => {
    const hit = line.match(/\d[\d.,%]*/);
    if (hit) errors.push(`${rel(file)}: número escrito à mão "${hit[0]}" em: "${line.trim().slice(0, 90)}" — use <Fact k="..."/>`);
  });
}

const contentDir = join(root, 'src/content');
const mdxFiles = walk(contentDir).filter((f) => f.endsWith('.mdx'));
const parsed = new Map();
for (const file of mdxFiles) {
  const p = parseMdx(file);
  if (!p) continue;
  parsed.set(file, p);
  checkDigits(file, p.body);
  checkDigits(file, p.summary);
  for (const k of p.factKeys) if (!(k in facts)) errors.push(`${rel(file)}: <Fact k="${k}"> não existe em facts.ts`);
  for (const src of p.gallery) {
    if (!existsSync(join(dirname(file), src))) errors.push(`${rel(file)}: imagem não encontrada ${src}`);
  }
  if (p.gallery.length !== p.alts.length) errors.push(`${rel(file)}: toda imagem da galeria precisa de alt`);
  for (const id of p.diagrams) {
    const lang = file.endsWith('.en.mdx') ? 'en' : 'pt';
    const mmd = join(dirname(file), 'diagrams', `${id}.${lang}.mmd`);
    if (!existsSync(mmd)) errors.push(`${rel(file)}: diagrama não encontrado ${rel(mmd)}`);
  }
  if (/\[PENDENTE/.test(p.raw)) pending.push(`${rel(file)}: contém [PENDENTE]`);
  if (/^status:\s*rascunho/m.test(p.fm)) pending.push(`${rel(file)}: texto em rascunho, aguardando aprovação`);
}

// Paridade PT/EN
for (const [file, pt] of parsed) {
  if (file.endsWith('.en.mdx')) continue;
  const enFile = file.replace(/\.mdx$/, '.en.mdx');
  const en = parsed.get(enFile);
  if (!en) { errors.push(`${rel(file)}: falta a versão em inglês ${rel(enFile)}`); continue; }
  const a = [...new Set(pt.factKeys)].sort().join(',');
  const b = [...new Set(en.factKeys)].sort().join(',');
  if (a !== b) errors.push(`${rel(file)}: PT e EN usam fatos diferentes\n    pt: ${a}\n    en: ${b}`);
  if (pt.diagrams.join() !== en.diagrams.join()) errors.push(`${rel(file)}: PT e EN têm diagramas diferentes`);
  if (pt.gallery.join() !== en.gallery.join()) errors.push(`${rel(file)}: PT e EN têm galerias diferentes`);
}

// ---------- 6. ui.ts ----------
const ptKeys = Object.keys(ui.pt).sort().join();
const enKeys = Object.keys(ui.en).sort().join();
if (ptKeys !== enKeys) errors.push('src/i18n/ui.ts: chaves diferentes entre pt e en');
for (const lang of ['pt', 'en']) {
  for (const [k, v] of Object.entries(ui[lang])) {
    if (/\d/.test(v)) errors.push(`src/i18n/ui.ts: ${lang}.${k} tem número escrito à mão: "${v}"`);
  }
}

// ---------- Relatório ----------
console.log(`check:content · CV ${CV_VERSION} · ${Object.keys(facts).length} fatos · ${mdxFiles.length} arquivos MDX`);
if (pending.length) {
  console.log(`\nPendências (${pending.length})${strict ? ' — bloqueiam no modo --strict' : ''}:`);
  for (const p of pending) console.log(`  - ${p}`);
}
if (errors.length) {
  console.error(`\nErros (${errors.length}):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
}
const fail = errors.length > 0 || (strict && pending.length > 0);
console.log(fail ? '\nFALHOU' : '\nOK');
process.exit(fail ? 1 : 0);
