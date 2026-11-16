// Lighthouse CI: perfil de celular (padrão do Lighthouse), todas as páginas estáticas, meta ≥ 95 nas 4 categorias.
// A raiz "/" é renderizada no servidor e não existe no build estático; ela é coberta pelos testes de ponta a ponta.
const slugs = ['ai-sales-os', 'indexa', 'noar', 'sgor'];
const paths = ['/pt/', '/en/', ...slugs.map((s) => `/pt/projetos/${s}/`), ...slugs.map((s) => `/en/projects/${s}/`)];

module.exports = {
  ci: {
    collect: {
      staticDistDir: './.vercel/output/static',
      url: paths.map((p) => `http://localhost${p}`),
      // 3 execuções por página; a meta vale para a mediana (ruído do runner não reprova sozinho).
      numberOfRuns: 3,
      settings: { chromeFlags: '--no-sandbox' },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.95, aggregationMethod: 'median' }],
        'categories:accessibility': ['error', { minScore: 0.95, aggregationMethod: 'median' }],
        'categories:best-practices': ['error', { minScore: 0.95, aggregationMethod: 'median' }],
        'categories:seo': ['error', { minScore: 0.95, aggregationMethod: 'median' }],
      },
    },
    upload: { target: 'filesystem', outputDir: './.lighthouseci' },
  },
};
