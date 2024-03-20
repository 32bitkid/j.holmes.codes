import { z, defineCollection, reference } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string().optional(),
    pubDate: z.date().optional(),
    authorDate: z.date().optional(),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
  }),
});

const sci0GamesCollection = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    year: z.number(),
    engine: z.enum(['sci0', 'sci01']),
    aspectRatio: z.enum(['1:1.2', '1:1']),
  }),
});

const sci0PicsCollection = defineCollection({
  type: 'data',
  schema: ({ image }) =>
    z.object({
      title: reference('sci0games'),
      pic: z.number().int(),
      compression: z.number(),
      content: z.string(),
      thumbnail: image(),
      thumbnailAlt: z.string(),
    }),
});

export const collections = {
  blog: blogCollection,
  sci0pics: sci0PicsCollection,
  sci0games: sci0GamesCollection,
};
