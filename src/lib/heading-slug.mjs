/**
 * Heading-id slugger shared by the rehype plugin (astro.config.mjs, which
 * assigns `id` attributes to h2 headings) and the writing slug page
 * (src/pages/writing/[...slug].astro, which reads the same h2 strings out of
 * the note body to build the conditional TOC). One algorithm, two callers:
 * the anchors can never drift apart.
 *
 * GitHub-style: lowercase, alphanumerics and hyphens only, spaces → hyphens.
 */
export function slugifyHeading(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * The `text` an h2 renders to, given its raw markdown source line (e.g.
 * "Some `code` and [links](#)"): strips code spans, links, emphasis so the
 * markdown line and the rendered heading slug to the same id.
 */
export function headingTextFromMarkdown(raw) {
  return String(raw)
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_]+([^*_]+)[*_]+/g, '$1')
    .trim();
}
