import { ui, type UiKey } from './ui';
import type { Locale } from '../data/facts';

export const LOCALES = ['pt', 'en'] as const satisfies readonly Locale[];
export const HTML_LANG: Record<Locale, string> = { pt: 'pt-BR', en: 'en' };
export const OG_LOCALE: Record<Locale, string> = { pt: 'pt_BR', en: 'en_US' };

/** Segmento da rota de projetos em cada idioma. */
const PROJECTS_SEGMENT: Record<Locale, string> = { pt: 'projetos', en: 'projects' };

export function t(lang: Locale, key: UiKey): string {
  return ui[lang][key];
}

export function getLangFromUrl(url: URL): Locale {
  return url.pathname.startsWith('/en/') || url.pathname === '/en' ? 'en' : 'pt';
}

export function otherLang(lang: Locale): Locale {
  return lang === 'pt' ? 'en' : 'pt';
}

export function homePath(lang: Locale, hash = ''): string {
  return `/${lang}/${hash ? `#${hash}` : ''}`;
}

export function projectPath(lang: Locale, slug: string): string {
  return `/${lang}/${PROJECTS_SEGMENT[lang]}/${slug}/`;
}

/** Slug do projeto a partir da URL (/pt/projetos/indexa/ → indexa). */
export function slugFromUrl(url: URL): string | undefined {
  const m = url.pathname.match(/^\/(?:pt\/projetos|en\/projects)\/([^/]+)\/?$/);
  return m?.[1];
}

/** Caminhos equivalentes da página atual nos dois idiomas (para hreflang e alternador). */
export type Alternates = Record<Locale, string>;

export const MONTHS: Record<Locale, string[]> = {
  pt: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};
