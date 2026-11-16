// Lighthouse CI: perfil de celular (padrão do Lighthouse), todas as páginas estáticas, meta ≥ 95 nas 4 categorias.
// A raiz "/" é renderizada no servidor e não existe no build estático; ela é coberta pelos testes de ponta a ponta.
const slugs = ['ai-sales-os', 'indexa', 'noar', 'sgor'];
const paths = ['/pt/', '/en/', ...slugs.map((s) => `/pt/projetos/${s}/`), ...slugs.map((s) => `/en/projects/${s}/`)];

module.exports = {
  ci: {
    collect: {
      staticDistDir: './.vercel/output/static',
      url: paths.map((p) => `http://localhost${p}`),
      numberOfRuns: 1,
      settings: { chromeFlags: '--no-sandbox' },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
      },
    },
    upload: { target: 'filesystem', outputDir: './.lighthouseci' },
  },
};
