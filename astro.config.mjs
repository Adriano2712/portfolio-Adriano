// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// [PENDENTE] domínio próprio.
// Ordem: SITE_URL (definido na Vercel/CI) → domínio de produção que a Vercel informa no build → local.
const site =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:4321');

export default defineConfig({
  site,
  // Tudo estático, exceto a raiz "/", que detecta o idioma no servidor (prerender = false).
  output: 'static',
  adapter: vercel(),
  trailingSlash: 'always',
  // CSS pequeno vai inline: tira a requisição que bloqueia a renderização.
  build: { inlineStylesheets: 'always' },
  integrations: [mdx(), sitemap(), react()],
  // Código com tema claro e escuro; o escuro é o padrão, como o site.
  markdown: { shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: 'dark' } },
  vite: { plugins: [tailwindcss()] },
  // A barra de ferramentas do modo dev atrapalha os testes de layout (Playwright).
  devToolbar: { enabled: process.env.PLAYWRIGHT !== '1' },
});
