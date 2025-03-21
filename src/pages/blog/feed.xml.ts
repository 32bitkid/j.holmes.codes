import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { blogSorting } from '@utils/blogSorting';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const blog = await getCollection('blog', ({ data }) => data.published);
  return rss({
    // `<title>` field in output xml
    title: 'J. Holmes Codes',
    // `<description>` field in output xml
    description: `thirty-two's random thoughts on thoughts`,
    // Pull in your project "site" from the endpoint context
    // https://docs.astro.build/en/reference/api-reference/#contextsite
    site: context.site ?? 'https://j.holmes.codes/',
    // Array of `<item>`s in output xml
    // See "Generating items" section for examples using content collections and glob imports
    items: blog.toSorted(blogSorting).map((post) => ({
      title: post.data.title,
      pubDate: post.data.authorDate,
      link: post.slug,
    })),
    // (optional) inject custom xml
    customData: '<language>en-us</language>',
  });
}
