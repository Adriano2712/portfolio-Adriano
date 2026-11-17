import { test, expect, type Page } from '@playwright/test';

const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36';
const GOOGLEBOT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

const PAGES = [
  { path: '/pt/', lang: 'pt-BR', other: '/en/' },
  { path: '/en/', lang: 'en', other: '/pt/' },
  ...['ai-sales-os', 'indexa', 'noar', 'sgor'].flatMap((s) => [
    { path: `/pt/projetos/${s}/`, lang: 'pt-BR', other: `/en/projects/${s}/` },
    { path: `/en/projects/${s}/`, lang: 'en', other: `/pt/projetos/${s}/` },
  ]),
];

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, 'a página não pode rolar na horizontal').toBeLessThanOrEqual(0);
}

test.describe('páginas', () => {
  for (const p of PAGES) {
    test(`${p.path} carrega, tem idioma, h1, hreflang e nenhuma rolagem horizontal`, async ({ page }) => {
      const res = await page.goto(p.path);
      expect(res?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', p.lang);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hreflang="pt-BR"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${p.path.replace(/\//g, '\\/')}$`));
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{40,}/);
      // alternador aponta para a página equivalente no outro idioma
      await expect(page.locator(`a[data-set-lang][href="${p.other}"]`)).toHaveCount(1);
      // toda imagem tem texto alternativo
      const semAlt = await page.locator('img:not([alt]), img[alt=""]').count();
      expect(semAlt).toBe(0);
      await page.waitForLoadState('networkidle');
      await expectNoHorizontalScroll(page);
    });
  }
});

test('início: cards levam aos estudos de caso', async ({ page }) => {
  await page.goto('/pt/');
  await page.getByRole('link', { name: /Ler o estudo de caso.*Indexa/ }).click();
  await expect(page).toHaveURL(/\/pt\/projetos\/indexa\/$/);
  await expect(page.locator('h1')).toHaveText('Indexa');
});

test('início: números vêm do facts.ts (amostra)', async ({ page }) => {
  await page.goto('/pt/');
  await expect(page.getByText('126 de 129').first()).toBeVisible();
  await expect(page.getByText('~290').first()).toBeVisible();
  await page.goto('/en/');
  await expect(page.getByText('126 of 129').first()).toBeVisible();
});

test('estudo de caso: diagrama e galeria', async ({ page }) => {
  await page.goto('/pt/projetos/indexa/');
  await expect(page.locator('figure svg[role="img"]')).toHaveCount(2);
  await expect(page.locator('picture img')).toHaveCount(6);
});

test.describe('idioma na raiz', () => {
  test('navegador em português vai para /pt/', async ({ browser }) => {
    const ctx = await browser.newContext({ userAgent: CHROME_UA, locale: 'pt-BR' });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page).toHaveURL(/\/pt\/$/);
    await ctx.close();
  });

  test('navegador em inglês vai para /en/', async ({ browser }) => {
    const ctx = await browser.newContext({ userAgent: CHROME_UA, locale: 'en-US' });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page).toHaveURL(/\/en\/$/);
    await ctx.close();
  });

  test('país Brasil (cabeçalho da Vercel) vai para /pt/', async ({ request }) => {
    const res = await request.get('/', {
      headers: { 'user-agent': CHROME_UA, 'accept-language': 'en-US', 'x-vercel-ip-country': 'BR' },
      maxRedirects: 0,
    });
    expect(res.status()).toBe(302);
    expect(res.headers()['location']).toBe('/pt/');
    expect(res.headers()['cache-control']).toContain('no-store');
  });

  test('robô não é redirecionado e recebe links para os dois idiomas', async ({ request }) => {
    const res = await request.get('/', { headers: { 'user-agent': GOOGLEBOT }, maxRedirects: 0 });
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toContain('href="/pt/"');
    expect(html).toContain('href="/en/"');
    expect(html).toContain('hreflang="x-default"');
  });

  test('a escolha no alternador fica salva', async ({ browser }) => {
    const ctx = await browser.newContext({ userAgent: CHROME_UA, locale: 'pt-BR' });
    const page = await ctx.newPage();
    await page.goto('/pt/projetos/indexa/');
    await page.locator('a[data-set-lang="en"]').click();
    await expect(page).toHaveURL(/\/en\/projects\/indexa\/$/);
    await expect(page.locator('h1')).toHaveText('Indexa');
    await page.goto('/');
    await expect(page).toHaveURL(/\/en\/$/);
    await ctx.close();
  });
});

test('menu do celular abre e tem alvos de 44 px', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'só no celular');
  await page.goto('/pt/');
  await page.locator('header summary').click();
  const link = page.locator('details[open] a').first();
  await expect(link).toBeVisible();
  const box = await link.boundingBox();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
});

test.describe('demo do Indexa', () => {
  test('PT: valor padrão, troca de índice e "não reduzir"', async ({ page }) => {
    await page.goto('/pt/');
    const demo = page.locator('#demo');
    await demo.scrollIntoViewIfNeeded();
    await page.waitForSelector('#demo astro-island:not([ssr])'); // ilha React hidratada
    const valor = demo.getByTestId('novo-valor');
    await expect(valor).toHaveText('R$ 2.606,61');
    await expect(demo.getByTestId('percentual')).toHaveText('4,2644%');
    await expect(demo.getByText('Demonstração simplificada, não o sistema completo.')).toBeVisible();

    await demo.getByRole('button', { name: 'IGP-M' }).click();
    await expect(valor).toHaveText('R$ 2.473,95');

    await demo.getByText('Cláusulas').click();
    await demo.getByLabel('Não reduzir o valor').check();
    await expect(valor).toHaveText('R$ 2.500,00');
    await expect(demo.getByTestId('regra')).toHaveText('Não redução: mantém o valor');

    await demo.getByRole('button', { name: 'Fixo' }).click();
    await demo.getByLabel('Valor atual').fill('1.650,00');
    await expect(valor).toHaveText('R$ 1.732,50');
  });

  test('EN: formato de número em inglês e valor inválido', async ({ page }) => {
    await page.goto('/en/');
    const demo = page.locator('#demo');
    await demo.scrollIntoViewIfNeeded();
    await page.waitForSelector('#demo astro-island:not([ssr])');
    await expect(demo.getByTestId('novo-valor')).toHaveText('R$ 2,606.61');
    await demo.getByLabel('Current value').fill('abc');
    await expect(demo.getByText('Enter a positive amount in reais.')).toBeVisible();
  });
});

test('zoom: diagrama e imagem abrem em tela cheia e fecham', async ({ page }) => {
  await page.goto('/pt/projetos/indexa/');
  await page.waitForLoadState('networkidle'); // script do zoom carregado
  await page.locator('[data-zoom-svg]').first().click();
  const dialog = page.locator('dialog#zoom');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('svg[role="img"]')).toHaveCount(1);
  await dialog.getByRole('button', { name: 'Fechar' }).click();
  await expect(dialog).toBeHidden();

  await page.locator('a[data-zoom-img]').first().click();
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('img')).toHaveAttribute('src', /.+/);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('botão de tema alterna claro/escuro e lembra a escolha', async ({ browser }) => {
  const ctx = await browser.newContext({ colorScheme: 'dark' });
  const page = await ctx.newPage();
  await page.goto('/pt/');
  await page.waitForLoadState('networkidle');
  const html = page.locator('html');
  const btn = page.locator('header [data-theme-toggle]');
  await expect(btn).toHaveAttribute('aria-label', 'Ativar modo claro');
  const bgDark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

  await btn.click();
  await expect(html).toHaveAttribute('data-theme', 'light');
  await expect(btn).toHaveAttribute('aria-label', 'Ativar modo escuro');
  const bgLight = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bgLight).not.toBe(bgDark);

  await page.goto('/en/projects/indexa/');
  await expect(html).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('header [data-theme-toggle]')).toHaveAttribute('aria-label', 'Switch to dark mode');
  await ctx.close();
});

test.describe('Open Graph', () => {
  for (const p of PAGES) {
    test(`${p.path} tem og:image 1200×630 que existe`, async ({ page, request }) => {
      await page.goto(p.path);
      const og = await page.locator('meta[property="og:image"]').getAttribute('content');
      expect(og).toMatch(/\/og\/[a-z-]+-(pt|en)\.png$/);
      expect(og).toContain(p.lang === 'en' ? '-en.png' : '-pt.png');
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
      const res = await request.get(new URL(og!).pathname);
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toContain('image/png');
    });
  }
});

test('NoAr: acesso de visitante e página de status pública', async ({ page }) => {
  await page.goto('/pt/projetos/noar/');
  const box = page.locator('[data-demo-access]');
  await expect(box).toContainText('visitante@gmail.com');
  await expect(box).toContainText('teste123');
  await expect(box.getByRole('link')).toHaveAttribute('href', /no-ar-navy\.vercel\.app\/status\/[0-9a-f-]{36}$/);
  await expect(page.getByRole('link', { name: 'Ver no ar' })).toHaveAttribute('href', 'https://no-ar-navy.vercel.app/login');
  await page.goto('/en/projects/noar/');
  await expect(page.locator('[data-demo-access]')).toContainText('Visitor access');
});
