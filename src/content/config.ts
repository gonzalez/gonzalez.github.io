import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Digital-garden writing: notes mature at the operator's discretion
// (seedling → growing → evergreen). MDX allowed; internal links encouraged.
const writing = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    createdDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    maturity: z.enum(['seedling', 'growing', 'evergreen']),
    draft: z.boolean().default(false),
  }),
});

// Projects as a text directory: name, one-liner, tech, status, GitHub link.
// `github` is optional: some projects have no public repository
// yet — the plan's copy discipline forbids inventing link targets for them.
// `links` carries extra public URLs; `writeUp`
// points at the garden note (or article) about the project.
const projects = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    technologies: z.array(z.string()).default([]),
    status: z.string(),
    github: z.string().url().optional(),
    writeUp: z.string().optional(),
    links: z
      .array(z.object({ label: z.string(), href: z.string().url() }))
      .optional(),
  }),
});

export const collections = { writing, projects };
