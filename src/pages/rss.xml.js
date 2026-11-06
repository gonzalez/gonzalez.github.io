import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { site } from '../content/site';

// RSS over the writing collection with the real frontmatter dates — every
// item's pubDate is the note's createdDate, never a build timestamp.
export async function GET(context) {
  const notes = (
    await getCollection('writing', (entry) => !entry.data.draft)
  ).sort((a, b) => b.data.createdDate.getTime() - a.data.createdDate.getTime());

  return rss({
    title: 'gonzalez — digital garden',
    description:
      'Notes on agentic development and open-source work — a digital garden under cultivation.',
    site: context.site ?? site.url,
    items: notes.map((note) => ({
      title: note.data.title,
      description: note.data.description,
      pubDate: note.data.createdDate,
      link: `/writing/${note.id}/`,
      categories: note.data.tags,
    })),
  });
}
