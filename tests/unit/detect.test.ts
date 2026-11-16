import { describe, expect, it } from 'vitest';
import { detectLang, isBot, preferredLanguage, readLangCookie } from '../../src/i18n/detect';

const CHROME = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36';

describe('detectLang', () => {
  it('Brasil vai para pt, mesmo com navegador em inglês', () => {
    expect(detectLang({ country: 'BR', acceptLanguage: 'en-US,en;q=0.9' })).toBe('pt');
  });
  it('fora do Brasil, navegador em português vai para pt', () => {
    expect(detectLang({ country: 'PT', acceptLanguage: 'pt-PT,pt;q=0.9,en;q=0.8' })).toBe('pt');
  });
  it('fora do Brasil, navegador em outro idioma vai para en', () => {
    expect(detectLang({ country: 'DE', acceptLanguage: 'de-DE,de;q=0.9,en;q=0.8' })).toBe('en');
  });
  it('sem país e sem idioma vai para en', () => {
    expect(detectLang({})).toBe('en');
  });
  it('país em minúsculas também conta', () => {
    expect(detectLang({ country: 'br' })).toBe('pt');
  });
  it('escolha salva no cookie vence país e navegador', () => {
    expect(detectLang({ cookie: 'x=1; lang=en', country: 'BR', acceptLanguage: 'pt-BR' })).toBe('en');
    expect(detectLang({ cookie: 'lang=pt', country: 'US', acceptLanguage: 'en-US' })).toBe('pt');
  });
  it('cookie com valor inválido é ignorado', () => {
    expect(detectLang({ cookie: 'lang=fr', acceptLanguage: 'pt-BR' })).toBe('pt');
  });
});

describe('preferredLanguage', () => {
  it('usa o maior peso q', () => {
    expect(preferredLanguage('en;q=0.5, pt-BR;q=0.9')).toBe('pt-br');
  });
  it('empate fica com o primeiro', () => {
    expect(preferredLanguage('en-US, pt-BR')).toBe('en-us');
  });
  it('ignora curinga e peso zero', () => {
    expect(preferredLanguage('*, pt;q=0, en;q=0.1')).toBe('en');
  });
  it('cabeçalho vazio', () => {
    expect(preferredLanguage('')).toBeUndefined();
    expect(preferredLanguage(null)).toBeUndefined();
  });
});

describe('readLangCookie', () => {
  it('não confunde com cookies de nome parecido', () => {
    expect(readLangCookie('xlang=en')).toBeUndefined();
    expect(readLangCookie('a=1; lang=en; b=2')).toBe('en');
  });
});

describe('isBot', () => {
  it.each([
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
    'LinkedInBot/1.0 (compatible; Mozilla/5.0)',
    'facebookexternalhit/1.1',
    'WhatsApp/2.23',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome-Lighthouse',
  ])('robô: %s', (ua) => expect(isBot(ua)).toBe(true));

  it('navegador comum não é robô', () => expect(isBot(CHROME)).toBe(false));
  it('sem user-agent é tratado como robô (não redireciona)', () => expect(isBot('')).toBe(true));
});
