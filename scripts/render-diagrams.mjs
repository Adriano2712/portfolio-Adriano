#!/usr/bin/env node
/**
 * Gera SVG a partir dos .mmd em src/content/projects/<slug>/diagrams/.
 *
 *   npm run diagrams
 *
 * Por quê assim (ADR-0002): Mermaid roda no build, não no navegador. Renderizamos num Chromium headless
 * (o mesmo do Playwright, já usado nos testes) e salvamos o SVG ao lado do .mmd. O SVG é versionado,
 * então o build da Vercel não precisa de navegador.
 *
 * Cores: o Mermaid recebe cores "sentinela" e o script troca cada uma por uma variável CSS do site.
 * Assim o mesmo SVG funciona no modo escuro e no claro.
 */
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const mermaidJs = readFileSync(require.resolve('mermaid/dist/mermaid.min.js'), 'utf8');
const interWoff2 = readFileSync(require.resolve('@fontsource/inter/files/inter-latin-400-normal.woff2')).toString('base64');

// sentinela → variável CSS (definidas em src/styles/global.css)
const SENTINELS = {
  '#0a0a01': 'var(--color-surface)',
  '#0a0a02': 'var(--color-text)',
  '#0a0a03': 'var(--color-border)',
  '#0a0a04': 'var(--color-muted)',
  '#0a0a05': 'var(--color-surface-2)',
  '#0a0a06': 'var(--color-accent)',
  '#0a0a07': 'var(--color-bg)',
};
const themeVariables = {
  fontFamily: 'Inter, sans-serif',
  fontSize: '15px',
  background: '#0a0a07',
  primaryColor: '#0a0a01',
  primaryTextColor: '#0a0a02',
  primaryBorderColor: '#0a0a03',
  secondaryColor: '#0a0a05',
  secondaryTextColor: '#0a0a02',
  secondaryBorderColor: '#0a0a03',
  tertiaryColor: '#0a0a05',
  tertiaryTextColor: '#0a0a02',
  tertiaryBorderColor: '#0a0a03',
  lineColor: '#0a0a04',
  textColor: '#0a0a02',
  mainBkg: '#0a0a01',
  nodeBorder: '#0a0a03',
  clusterBkg: '#0a0a05',
  clusterBorder: '#0a0a06',
  titleColor: '#0a0a02',
  edgeLabelBackground: '#0a0a07',
  labelBackground: '#0a0a07',
};

const projectsDir = join(root, 'src/content/projects');
const jobs = [];
for (const slug of readdirSync(projectsDir)) {
  const dir = join(projectsDir, slug, 'diagrams');
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.mmd'))) {
    jobs.push({ id: `d-${slug}-${f.replace(/\.mmd$/, '').replace(/\./g, '-')}`, src: join(dir, f), out: join(dir, f.replace(/\.mmd$/, '.svg')) });
  }
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(`<!doctype html><html><head><style>
@font-face{font-family:Inter;src:url(data:font/woff2;base64,${interWoff2}) format('woff2');font-weight:400}
body{font-family:Inter}</style></head><body></body></html>`);
await page.addScriptTag({ content: mermaidJs });
await page.evaluate(async () => { await document.fonts.ready; });
await page.evaluate((tv) => {
  // eslint-disable-next-line no-undef
  mermaid.initialize({ startOnLoad: false, theme: 'base', themeVariables: tv, securityLevel: 'strict', flowchart: { htmlLabels: false, useMaxWidth: true }, state: { useMaxWidth: true } });
}, themeVariables);

let failed = 0;
for (const job of jobs) {
  const code = readFileSync(job.src, 'utf8');
  try {
    // eslint-disable-next-line no-undef
    let svg = await page.evaluate(async ([id, c]) => (await mermaid.render(id, c)).svg, [job.id, code]);
    for (const [hex, css] of Object.entries(SENTINELS)) svg = svg.replace(new RegExp(hex, 'gi'), css);
    // Sombras via <filter> custam caro para pintar no celular e não acrescentam informação.
    svg = svg
      .replace(/<filter[\s\S]*?<\/filter>/g, '')
      .replace(/\sfilter="url\([^)]*\)"/g, '')
      .replace(/filter:\s*(?:url|drop-shadow)\((?:[^()]|\([^()]*\))*\);?/g, '');
    const leftovers = [...new Set((svg.match(/#[0-9a-f]{6}\b/gi) ?? []).map((h) => h.toLowerCase()))];
    writeFileSync(job.out, svg);
    console.log(`✓ ${job.out.slice(root.length + 1)}${leftovers.length ? `  (cores fixas restantes: ${leftovers.join(' ')})` : ''}`);
  } catch (e) {
    failed++;
    console.error(`✗ ${job.src.slice(root.length + 1)}: ${e.message.split('\n')[0]}`);
  }
}
await browser.close();
process.exit(failed ? 1 : 0);
