import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const lang = z.enum(['pt', 'en']);

/** "indexa/index.mdx" → "indexa/pt"; "indexa/index.en.mdx" → "indexa/en" */
function idFromPath({ entry }: { entry: string }) {
  const p = entry.replaceAll('\\', '/');
  const isEn = p.endsWith('index.en.mdx');
  const dir = p.replace(/\/?index(\.en)?\.mdx$/, '');
  return `${dir || 'root'}/${isEn ? 'en' : 'pt'}`;
}

const projects = defineCollection({
  loader: glob({ pattern: '**/index{,.en}.mdx', base: './src/content/projects', generateId: idFromPath }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      lang,
      kind: z.enum(['personal', 'professional']),
      order: z.number(),
      summary: z.string(),
      highlight: z
        .union([
          z.object({ fact: z.string(), label: z.string() }),
          z.object({ text: z.string(), label: z.string() }),
        ])
        .nullable(),
      stack: z.array(z.string()),
      repo: z.string().nullable(),
      diagrams: z.array(z.object({ id: z.string(), caption: z.string() })),
      gallery: z.array(z.object({ src: image(), alt: z.string() })),
      statusPage: z.string().nullable().optional(),
      /** Sistema publicado; vira o botão "Ver no ar" no topo do case. */
      live: z.string().url().nullable().optional(),
      /** Chave em demoAccess (src/data/facts.ts): mostra o login de visitante no topo do case. */
      demo: z.string().nullable().optional(),
    }),
});

const about = defineCollection({
  loader: glob({ pattern: 'index{,.en}.mdx', base: './src/content/about', generateId: idFromPath }),
  schema: z.object({ lang, status: z.string(), photo: z.null() }),
});

export const collections = { projects, about };
