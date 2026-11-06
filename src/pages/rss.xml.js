import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

// RSS over the writing collection with the real frontmatter dates — every
// item's pubDate is the note's createdDate, never a build timestamp.
export async function GET(context) {
  // `context.site` comes from `site` in astro.config.mjs; the literal is a
  // defensive fallback so the feed stays absolute if that config is removed.
  const siteUrl = context.site ?? 'https://gonzalez.github.io';

  const notes = (
    await getCollection('writing', (entry) => !entry.data.draft)
  ).sort((a, b) => b.data.createdDate.getTime() - a.data.createdDate.getTime());

  return rss({
    title: 'gonzalez — digital garden',
    description:
      'Notes on agentic development and open-source work — a digital garden under cultivation.',
    site: siteUrl,
    items: notes.map((note) => ({
      title: note.data.title,
      description: note.data.description,
      pubDate: note.data.createdDate,
      link: `/writing/${note.id}/`,
      categories: note.data.tags,
    })),
  });
}
