#!/usr/bin/env node
/**
 * Gera as imagens Open Graph (1200×630) em public/og/: início e cada estudo de caso, em PT e EN.
 *
 *   npm run og
 *
 * Mesmo esquema dos diagramas: HTML com as fontes e os tokens do site, fotografado pelo Chromium do Playwright.
 * Números vêm de src/data/facts.ts; título e resumo dos projetos, do frontmatter dos MDX.
 */
import { chromium } from '@playwright/test';
import { readFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { facts, profile } = await import(pathToFileURL(join(root, 'src/data/facts.ts')).href);
const { ui } = await import(pathToFileURL(join(root, 'src/i18n/ui.ts')).href);

const font = (pkg, file) => readFileSync(require.resolve(`${pkg}/files/${file}`)).toString('base64');
const fonts = {
  inter400: font('@fontsource/inter', 'inter-latin-400-normal.woff2'),
  inter600: font('@fontsource/inter', 'inter-latin-600-normal.woff2'),
  mono500: font('@fontsource/jetbrains-mono', 'jetbrains-mono-latin-500-normal.woff2'),
  mono700: font('@fontsource/jetbrains-mono', 'jetbrains-mono-latin-700-normal.woff2'),
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function frontmatter(file) {
  const fm = readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)[1];
  const get = (re) => fm.match(re)?.[1]?.trim();
  return {
    title: get(/^title:\s*(.+)$/m),
    kind: get(/^kind:\s*(.+)$/m),
    summary: get(/^summary:\s*(.+)$/m),
    fact: get(/^\s+fact:\s*(\S+)$/m),
    text: get(/^\s+text:\s*(.+)$/m),
    label: get(/^\s+label:\s*(.+)$/m),
  };
}

function page({ eyebrow, title, subtitle, metric, metricLabel, footer }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Inter;font-weight:400;src:url(data:font/woff2;base64,${fonts.inter400}) format('woff2')}
@font-face{font-family:Inter;font-weight:600;src:url(data:font/woff2;base64,${fonts.inter600}) format('woff2')}
@font-face{font-family:'JetBrains Mono';font-weight:500;src:url(data:font/woff2;base64,${fonts.mono500}) format('woff2')}
@font-face{font-family:'JetBrains Mono';font-weight:700;src:url(data:font/woff2;base64,${fonts.mono700}) format('woff2')}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#0b0d10;color:#e8ecf1;font-family:Inter,sans-serif;padding:64px 72px;display:flex;flex-direction:column;justify-content:space-between;
  background-image:linear-gradient(#1b2129 1px,transparent 1px),linear-gradient(90deg,#1b2129 1px,transparent 1px);background-size:48px 48px;background-position:-1px -1px}
.top{display:flex;justify-content:space-between;align-items:center;font-family:'JetBrains Mono',monospace;font-size:24px}
.brand{font-weight:700}.dot{display:inline-block;width:12px;height:12px;border-radius:50%;background:#3ddc97;margin-right:12px}
.status{color:#9aa4b2;display:flex;align-items:center}
.eyebrow{font-family:'JetBrains Mono',monospace;font-size:24px;color:#9aa4b2;margin-bottom:16px}
h1{font-family:'JetBrains Mono',monospace;font-weight:700;letter-spacing:-0.03em;line-height:1.05;font-size:${title.length > 16 ? 68 : 84}px}
.sub{margin-top:20px;font-size:30px;line-height:1.35;color:#9aa4b2;max-width:900px}.sub strong{color:#e8ecf1;font-weight:600}
.bottom{display:flex;align-items:flex-end;justify-content:space-between;gap:32px}
.metric{background:#12161b;border:2px solid #2a323d;border-radius:12px;padding:22px 28px;max-width:720px}
.metric .v{font-family:'JetBrains Mono',monospace;font-weight:500;color:#3ddc97;font-size:48px;line-height:1.1}
.metric .l{font-size:24px;margin-top:6px;color:#e8ecf1}
.footer{font-family:'JetBrains Mono',monospace;font-size:22px;color:#9aa4b2;text-align:right;white-space:nowrap}
</style></head><body>
<div class="top"><span class="brand">adriano.prado</span><span class="status"><span class="dot"></span>${esc(footer.status)}</span></div>
<div><p class="eyebrow">${esc(eyebrow)}</p><h1>${esc(title)}</h1><p class="sub">${subtitle}</p></div>
<div class="bottom">${metric ? `<div class="metric"><div class="v">${esc(metric)}</div><div class="l">${esc(metricLabel)}</div></div>` : '<div></div>'}<div class="footer">${esc(footer.right)}</div></div>
</body></html>`;
}

const jobs = [];
for (const lang of ['pt', 'en']) {
  const t = ui[lang];
  jobs.push({
    out: `home-${lang}.png`,
    html: page({
      eyebrow: lang === 'pt' ? 'Portfólio' : 'Portfolio',
      title: profile.name,
      subtitle: `<strong>${esc(t['hero.title'])}</strong> ${esc(t['hero.tagline'])}`,
      metric: facts['indexa.oracleMatched'][lang],
      metricLabel: `Indexa · ${t['hero.proofOracle']}`,
      footer: { status: profile.availability[lang], right: 'React · TypeScript · Python · C#/.NET' },
    }),
  });
  const dir = join(root, 'src/content/projects');
  for (const slug of readdirSync(dir)) {
    const file = join(dir, slug, lang === 'pt' ? 'index.mdx' : 'index.en.mdx');
    if (!existsSync(file)) continue;
    const d = frontmatter(file);
    const metric = d.fact ? facts[d.fact][lang] : d.text;
    jobs.push({
      out: `${slug}-${lang}.png`,
      html: page({
        eyebrow: d.kind === 'professional' ? `${t['projects.professional']} · ${t['projects.notPublic']}` : `${t['projects.personal']} · ${t['meta.caseSuffix']}`,
        title: d.title,
        subtitle: esc(d.summary),
        metric,
        metricLabel: d.label,
        footer: { status: profile.availability[lang], right: profile.name },
      }),
    });
  }
}

const outDir = join(root, 'public/og');
mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const pageH = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const job of jobs) {
  await pageH.setContent(job.html, { waitUntil: 'load' });
  await pageH.evaluate(() => document.fonts.ready);
  const overflow = await pageH.evaluate(() => document.body.scrollHeight > 630 || document.body.scrollWidth > 1200);
  if (overflow) throw new Error(`${job.out}: conteúdo passou de 1200×630`);
  await pageH.screenshot({ path: join(outDir, job.out), type: 'png' });
  console.log(`✓ public/og/${job.out}`);
}
await browser.close();
