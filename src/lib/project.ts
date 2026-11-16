import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import type { Locale } from '../data/facts';
import { getLangFromUrl, slugFromUrl } from '../i18n/utils';

export type Project = CollectionEntry<'projects'>;

export function slugOf(entry: Project): string {
  return entry.id.split('/')[0];
}

export async function getProjects(lang: Locale): Promise<Project[]> {
  const all = await getCollection('projects', (e: Project) => e.data.lang === lang);
  return all.sort((a: Project, b: Project) => a.data.order - b.data.order);
}

/** Entrada do projeto da página atual (usada pelos componentes do MDX). */
export async function currentProject(url: URL): Promise<Project> {
  const slug = slugFromUrl(url);
  const lang = getLangFromUrl(url);
  const entry = slug ? await getEntry('projects', `${slug}/${lang}`) : undefined;
  if (!entry) throw new Error(`Projeto não encontrado para ${url.pathname}`);
  return entry;
}
