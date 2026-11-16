# ADR-0006 · Alerta do npm audit em path-to-regexp aceito

- **Decisão:** manter `@astrojs/vercel` 11 com o alerta alto de `path-to-regexp` (GHSA-9wv6-86v2-598j, expressão regular com backtracking), que chega por `@vercel/routing-utils`.
- **Alternativas:** `npm audit fix --force`, que rebaixa o adaptador para a 8.0.4, sem suporte ao Astro 7; trocar de hospedagem.
- **Motivo:** o pacote só roda no build, para gerar a configuração de rotas da Vercel a partir das nossas próprias rotas. Conferido: ele não está no código da função publicada (`.vercel/output/functions`), então nenhuma entrada de visitante passa por ele.
- **Custo de reverter:** nenhum; é só atualizar o adaptador quando sair a correção.
- **Gatilho:** nova versão do `@astrojs/vercel` sem o alerta, ou o pacote passar a ser usado em tempo de execução.
