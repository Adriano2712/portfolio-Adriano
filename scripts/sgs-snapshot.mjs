#!/usr/bin/env node
/**
 * Baixa IPCA (série 433) e IGP-M (série 189) da API SGS do Banco Central e grava
 * src/data/sgs/series.json, usado pela demo do Indexa. Sem chamada em tempo real no site.
 *
 *   npm run sgs:snapshot
 *
 * Valores ficam como texto ("0.16") para não passar por ponto flutuante.
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SERIES = { ipca: 433, igpm: 189 };
const today = new Date();
const br = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

const out = { snapshotDate: today.toISOString().slice(0, 10), source: 'API SGS do Banco Central (séries 433 e 189)', series: {} };
for (const [name, code] of Object.entries(SERIES)) {
  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${code}/dados?formato=json&dataInicial=01/01/2016&dataFinal=${br(today)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`SGS ${code}: HTTP ${res.status}`);
  const rows = await res.json();
  const map = {};
  for (const { data, valor } of rows) {
    const [, mm, yyyy] = data.split('/');
    if (!/^-?\d+(\.\d+)?$/.test(valor)) throw new Error(`SGS ${code}: valor inesperado "${valor}" em ${data}`);
    map[`${yyyy}-${mm}`] = valor;
  }
  out.series[name] = map;
  const keys = Object.keys(map);
  console.log(`${name}: ${keys.length} meses, ${keys[0]} a ${keys.at(-1)}`);
}
writeFileSync(join(root, 'src/data/sgs/series.json'), JSON.stringify(out, null, 1) + '\n');
console.log(`snapshot ${out.snapshotDate} gravado em src/data/sgs/series.json`);
