// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages *user* site — served from the domain root, so no basePath.
// Static export by hand: `astro build` emits `dist/` for the operator to
// review locally, then the operator's explicit push publishes it.
export default defineConfig({
  site: 'https://gonzalez.github.io',
  output: 'static',
  integrations: [mdx(), sitemap()],
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
