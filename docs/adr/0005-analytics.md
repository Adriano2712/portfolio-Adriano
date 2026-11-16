# ADR-0005 · Analytics sem cookies: Umami

- **Decisão:** Umami (Cloud ou auto-hospedado), carregado só em produção e só se `PUBLIC_UMAMI_WEBSITE_ID` e `PUBLIC_UMAMI_SRC` estiverem definidos na Vercel (`src/components/Analytics.astro`). Script com `defer` e `data-do-not-track="true"`; sem cookie, então sem banner de consentimento.
- **Alternativas:** Plausible (também sem cookies, mas só pago na versão hospedada); Vercel Web Analytics (integrado ao adaptador, mas fora da especificação e preso à Vercel); Google Analytics (usa cookies e exige consentimento).
- **Motivo:** código aberto, pode sair da nuvem para auto-hospedagem sem mudar o site, e o painel mostra o que importa aqui: visitas por página e por idioma, e cliques em "Baixar CV". [VALIDAR] limites e preço do plano gratuito do Umami Cloud na página oficial antes de criar a conta.
- **Custo de reverter:** baixo. Um componente e duas variáveis de ambiente.
- **Gatilho:** o Umami Cloud deixar de ter plano gratuito, ou o script reduzir a nota de Performance abaixo de 95.
