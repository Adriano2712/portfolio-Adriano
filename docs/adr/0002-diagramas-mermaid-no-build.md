# ADR-0002 · Diagramas Mermaid gerados como SVG e versionados

- **Decisão:** `npm run diagrams` (`scripts/render-diagrams.mjs`) renderiza cada `.mmd` num Chromium headless (o mesmo do Playwright) e salva o `.svg` ao lado, versionado. As cores do Mermaid são sentinelas trocadas por variáveis CSS (`var(--color-…)`), então o mesmo SVG serve no modo escuro e no claro. O SVG entra inline na página com `role="img"` e a legenda como `aria-label`.
- **Alternativas:** `@mermaid-js/mermaid-cli` (baixa outro Chrome via Puppeteer); `rehype-mermaid` no build (precisa de navegador no build da Vercel); Mermaid no navegador (JavaScript pesado em toda página).
- **Motivo:** zero JavaScript de diagrama no navegador e build da Vercel sem navegador. Spike validado: os 8 diagramas renderizam, e os de arquitetura ficaram verticais para caber na coluna de texto.
- **Custo de reverter:** baixo. Os `.mmd` continuam sendo a fonte.
- **Gatilho:** esquecer de rodar o script depois de editar um `.mmd` (mitigação na Etapa 5: o CI roda `npm run diagrams` e falha se houver diferença).
