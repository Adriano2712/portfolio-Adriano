#!/usr/bin/env node
// Resume os relatórios do Lighthouse CI (.lighthouseci) por página: mediana das execuções.
// No GitHub Actions, cada linha vira uma anotação (visível sem login na aba do job).
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const dir = '.lighthouseci';
if (!existsSync(dir)) { console.log('Sem relatórios em .lighthouseci'); process.exit(0); }
const byUrl = new Map();
for (const f of readdirSync(dir).filter((n) => n.startsWith('lhr-') && n.endsWith('.json'))) {
  const r = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8'));
  const path = new URL(r.finalDisplayedUrl).pathname;
  const row = Object.fromEntries(['performance', 'accessibility', 'best-practices', 'seo'].map((k) => [k, Math.round(r.categories[k].score * 100)]));
  row.tbt = Math.round(r.audits['total-blocking-time'].numericValue);
  row.lcp = Math.round(r.audits['largest-contentful-paint'].numericValue);
  row.cls = r.audits['cumulative-layout-shift'].numericValue.toFixed(3);
  row.failed = r.audits ? Object.values(r.audits).filter((a) => a.score !== null && a.score < 0.9 && a.scoreDisplayMode === 'binary').map((a) => a.id) : [];
  (byUrl.get(path) ?? byUrl.set(path, []).get(path)).push(row);
}
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
const gh = !!process.env.GITHUB_ACTIONS;
for (const [path, rows] of [...byUrl].sort()) {
  const m = (k) => median(rows.map((r) => Number(r[k])));
  const fails = [...new Set(rows.flatMap((r) => r.failed))];
  const line = `${path} · perf ${m('performance')} · a11y ${m('accessibility')} · bp ${m('best-practices')} · seo ${m('seo')} · TBT ${m('tbt')} ms · LCP ${m('lcp')} ms · CLS ${m('cls')}${fails.length ? ` · auditorias reprovadas: ${fails.join(', ')}` : ''}`;
  console.log(gh ? `::notice title=Lighthouse ${path}::${line}` : line);
}
