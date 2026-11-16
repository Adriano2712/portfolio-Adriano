#!/usr/bin/env node
/**
 * Confere, no HTML gerado pelo build, que todo número visível vem de src/data/facts.ts.
 *
 *   npm run build && npm run check:numbers
 *
 * Como funciona: para cada página, pega o texto visível (sem script, style, svg, pre, code e a ilha da demo),
 * remove todos os textos permitidos (valores de facts.ts, períodos do CV e uma lista curta de identificadores
 * técnicos) e falha se sobrar algum dígito.
 * A demo fica de fora de propósito: ela calcula valores a partir do que o visitante digita e tem teste próprio
 * de equivalência com o Indexa (tests/unit/reajuste.test.ts).
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, '.vercel/output/static');
if (!existsSync(outDir)) {
  console.error('Build não encontrado. Rode "npm run build" antes.');
  process.exit(1);
}
const f = await import(pathToFileURL(join(root, 'src/data/facts.ts')).href);

const allowed = new Set();
const add = (s) => s && allowed.add(String(s));
for (const fact of Object.values(f.facts)) { add(fact.pt); add(fact.en); }
for (const e of f.experience) { add(e.period.pt); add(e.period.en); }
for (const e of f.education) { add(e.period.pt); add(e.period.en); }
for (const c of f.certifications) { add(c.pt); add(c.en); }
add(f.profile.links.emailLabel);
add('Adriano2712'); // usuário do GitHub
const allowedSorted = [...allowed].sort((a, b) => b.length - a.length);

// Identificadores técnicos, não métricas. Mesma lista de scripts/check-content.mjs.
const PATTERNS = [/\bADR[- ]\d+\b/g, /\.NET \d+/g, /\b12 (meses|months)\b/g, /\b403\b/g, /\bES256\b/g];

function visibleText(html) {
  return html
    .replace(/<head[\s\S]*?<\/head>/gi, ' ')
    .replace(/<astro-island[\s\S]*?<\/astro-island>/gi, ' ')
    .replace(/<(script|style|svg|pre|code|template)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ');
}

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const pages = walk(outDir).filter((p) => p.endsWith('.html'));
const errors = [];
for (const page of pages) {
  let text = visibleText(readFileSync(page, 'utf8'));
  for (const re of PATTERNS) text = text.replace(re, ' ');
  // Texto permitido só conta como token inteiro: "3" não pode "esconder" o 3 de "33" ou de "403".
  for (const s of allowedSorted) {
    const esc = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    text = text.replace(new RegExp(`(?<![\\p{L}\\p{N}.,])${esc}(?![\\p{L}\\p{N}]|[.,]\\d)`, 'gu'), ' ');
  }
  for (const m of text.matchAll(/[^\s]*\d[^\s]*/g)) {
    const at = m.index ?? 0;
    errors.push(`${relative(outDir, page).replaceAll('\\', '/')}: "${m[0]}" em "…${text.slice(Math.max(0, at - 40), at + 40).trim()}…"`);
  }
}

console.log(`check:numbers · ${pages.length} páginas · ${allowed.size} textos permitidos`);
if (errors.length) {
  console.error(`\nNúmeros fora de facts.ts (${errors.length}):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log('OK');
