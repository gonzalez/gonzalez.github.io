// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { slugifyHeading } from './src/lib/heading-slug.mjs';

/** Collects the rendered text of an h2 and slugs it into a stable `id`. */
/**
 * @param {any} node
 * @param {string[]} runs
 * @returns {string[]}
 */
const collectHeadingText = (node, runs = []) => {
  if (node.type === 'text') runs.push(node.value);
  if (Array.isArray(node.children)) {
    for (const child of node.children) collectHeadingText(child, runs);
  }
  return runs;
};

/**
 * Rehype transformer: give every h2 a stable id so the conditional TOC can
 * deep-link. Local, dependency-free (rehype-slug and friends are not
 * installed; the plan's constraint is "no new dependencies" and the
 * algorithm is one shared slugify call). Only h2 gets ids because the TOC is
 * built from h2s only (≥ 3 rule, src/pages/writing/[...slug].astro — both
 * callers share the slugger in src/lib/heading-slug.mjs, so ids and TOC
 * anchors cannot drift).
 * @param {any} tree
 * @returns {void}
 */
const addHeadingIds = (tree) => {
  /** @param {any} node */
  const visit = (node) => {
    if (Array.isArray(node.children)) {
      for (const child of node.children) visit(child);
    }
    if (node.type === 'element' && node.tagName === 'h2' && !node.properties?.id) {
      const id = slugifyHeading(collectHeadingText(node).join(''));
      if (id) node.properties = { ...node.properties, id };
    }
  };
  visit(tree);
};

// rehype plugins are factories: called with settings, returning the transformer.
const rehypeHeadingIds = () => addHeadingIds;

// GitHub Pages *user* site — served from the domain root, so no basePath.
// Static export by hand: `astro build` emits `dist/` for the operator to
// review locally, then the operator's explicit push publishes it.
export default defineConfig({
  site: 'https://gonzalez.github.io',
  output: 'static',
  integrations: [mdx(), sitemap()],
  // Markdown/MDX: syntax highlighting with BOTH palettes — Shiki renders
  // github-light tokens inline and parks the github-dark palette in
  // `--shiki-dark` CSS variables that global.css flips for the dark theme
  // (and the ThemeToggle's pin). Zero dependencies: Shiki ships with Astro.
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
    rehypePlugins: [rehypeHeadingIds],
  },
  // Garden-sized CSS: inline the single global stylesheet into each page's
  // <head> so the first paint needs no extra request.
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    // Type-skew: @tailwindcss/vite targets a newer vite plugin-hook type
    // than the vite copy astro bundles; the runtime contract is compatible.
    // Cast keeps `npm run check` green until the skew resolves upstream.
    plugins: [/** @type {any} */ (tailwindcss())],
  },
});
