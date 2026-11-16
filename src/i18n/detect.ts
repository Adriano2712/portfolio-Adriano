import type { Locale } from '../data/facts';

/**
 * Detecção de idioma usada só na raiz "/" (ver docs/adr/0001-deteccao-de-idioma-na-raiz.md).
 * Função pura: recebe o que veio na requisição e devolve a decisão. Testada em tests/unit/detect.test.ts.
 */

export const LANG_COOKIE = 'lang';

// Robôs de busca e de pré-visualização de link nunca são redirecionados.
const BOT_RE =
  /bot|crawl|spider|slurp|bingpreview|mediapartners|facebookexternalhit|embedly|quora link preview|whatsapp|telegram|discord|skypeuripreview|google-inspectiontool|lighthouse|pagespeed|headlesschrome/i;

export function isBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return true; // sem user-agent: trata como robô e não redireciona
  return BOT_RE.test(userAgent);
}

/** Idioma preferido do navegador: o de maior peso q; empate fica com o primeiro. */
export function preferredLanguage(acceptLanguage: string | null | undefined): string | undefined {
  if (!acceptLanguage) return undefined;
  const items = acceptLanguage
    .split(',')
    .map((part, i) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
      const weight = q ? Number(q.slice(2)) : 1;
      return { tag: tag.trim().toLowerCase(), weight: Number.isFinite(weight) ? weight : 0, i };
    })
    .filter((x) => x.tag && x.tag !== '*' && x.weight > 0)
    .sort((a, b) => b.weight - a.weight || a.i - b.i);
  return items[0]?.tag;
}

export function readLangCookie(cookieHeader: string | null | undefined): Locale | undefined {
  const m = cookieHeader?.match(/(?:^|;\s*)lang=(pt|en)(?:;|$)/);
  return m ? (m[1] as Locale) : undefined;
}

export interface DetectInput {
  cookie?: string | null;
  country?: string | null;
  acceptLanguage?: string | null;
}

/**
 * Ordem: escolha salva (cookie) → país Brasil → navegador em português → inglês.
 */
export function detectLang({ cookie, country, acceptLanguage }: DetectInput): Locale {
  const saved = readLangCookie(cookie);
  if (saved) return saved;
  if (country?.toUpperCase() === 'BR') return 'pt';
  if (preferredLanguage(acceptLanguage)?.startsWith('pt')) return 'pt';
  return 'en';
}
