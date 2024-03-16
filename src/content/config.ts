import { z, defineCollection } from 'astro:content';

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

const sci0PicsCollection = defineCollection({
  type: 'data',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      pic: z.number().int(),
      engine: z.enum(['sci0', 'sci01']),
      compression: z.number(),
      content: z.string(),
      aspectRatio: z.enum(['1:1.2', '1:1']),
      thumbnail: image(),
      thumbnailAlt: z.string(),
    }),
});

export const collections = {
  blog: blogCollection,
  sci0pics: sci0PicsCollection,
};
