#!/usr/bin/env node
/**
 * Confere que cada .mmd tem um .svg gerado a partir da versão atual dele.
 * Compara o hash gravado no SVG (comentário "mmd-sha256") com o hash do .mmd. Não depende do sistema
 * operacional, ao contrário de comparar os bytes do SVG (a medição de texto muda entre Windows e Linux).
 *
 *   npm run check:diagrams
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sha256 = (s) => createHash('sha256').update(s.replace(/\r\n/g, '\n')).digest('hex');
const projectsDir = join(root, 'src/content/projects');
const errors = [];
let count = 0;
for (const slug of readdirSync(projectsDir)) {
  const dir = join(projectsDir, slug, 'diagrams');
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.mmd'))) {
    count++;
    const mmd = join(dir, f);
    const svg = mmd.replace(/\.mmd$/, '.svg');
    const rel = relative(root, svg).replaceAll('\\', '/');
    if (!existsSync(svg)) { errors.push(`${rel} não existe`); continue; }
    const recorded = readFileSync(svg, 'utf8').match(/^<!-- mmd-sha256: ([0-9a-f]{64}) -->/)?.[1];
    if (recorded !== sha256(readFileSync(mmd, 'utf8'))) errors.push(`${rel} está desatualizado em relação ao .mmd`);
  }
}
console.log(`check:diagrams · ${count} diagramas`);
if (errors.length) {
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error('Rode "npm run diagrams" e versione os SVG.');
  process.exit(1);
}
console.log('OK');
