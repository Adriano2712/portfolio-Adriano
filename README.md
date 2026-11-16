# portfolio-adriano

O portfólio que prova o que o CV diz: cada número aparece ao lado da sua evidência.

Astro (estático) + MDX + Tailwind, bilíngue em `/pt` e `/en`, hospedado na Vercel.

## Estado

| Etapa | Situação |
|---|---|
| 1 · Conteúdo | concluída |
| 2 · Design | concluída: opção A · Técnico ([docs/design/etapa-2.md](docs/design/etapa-2.md)) |
| 3 · Construção | concluída |
| 4 · Demo e extras | concluída |
| 5 · Qualidade e publicação | pronta para publicar; falta o deploy ([docs/deploy.md](docs/deploy.md)) |

## Como rodar

Requer Node 24+.

```bash
npm install
npx playwright install chromium   # para testes e2e e para gerar diagramas
npm run dev                       # http://localhost:4321  (a raiz "/" redireciona para /pt/ ou /en/)
npm run build                     # saída em .vercel/output
```

## Testes e verificações

```bash
npm run check:content          # números só via facts.ts, paridade PT/EN, alt nas imagens
npm run check:content:strict   # idem, e pendências bloqueiam (usar antes de publicar)
npm run test:unit              # Vitest: detecção de idioma e equivalência da demo com o Indexa (16 casos)
npm run test:e2e               # Playwright em 1440, 768 e celular (Pixel 7)
npm test                       # os três acima
npm run check:numbers          # depois do build: todo número exibido vem de facts.ts
npm run lighthouse             # depois do build: Lighthouse celular, mínimo 95 em todas as páginas
npm run diagrams               # regenera os SVG a partir dos .mmd (depois de editar um diagrama)
npm run sgs:snapshot           # atualiza a série do IPCA e do IGP-M usada pela demo
```

## Estrutura

| Onde | O quê |
|---|---|
| [src/data/facts.ts](src/data/facts.ts) | números e fatos do CV V8, fonte única PT/EN |
| [src/content/projects/](src/content/projects/) | estudos de caso em MDX (PT e EN), imagens e diagramas |
| [src/content/about/](src/content/about/) | texto do Sobre |
| [src/i18n/](src/i18n/) | textos de interface, rotas e detecção de idioma |
| [src/components/](src/components/) | componentes `.astro`; React só na demo (`IndexaDemo.tsx`) |
| [src/lib/reajuste.ts](src/lib/reajuste.ts) | motor de reajuste da demo, equivalente ao do Indexa |
| [src/pages/](src/pages/) | `/` (servidor), `/pt/`, `/en/`, `/pt/projetos/[slug]/`, `/en/projects/[slug]/`, 404 |
| [docs/adr/](docs/adr/) | decisões deste site |
| [docs/design/](docs/design/) | tokens e especificação do design |

## Regras de conteúdo

- MDX nunca tem número escrito à mão: usa `<Fact k="chave" />`.
- Fato com `source: 'cv'` guarda o trecho literal do CV; o teste confere que ele existe e que nenhum dígito mudou.
- Ao trocar a versão do CV: atualizar `docs/cv/`, `CV_VERSION` e `public/cv/`, e rodar `npm test`.
