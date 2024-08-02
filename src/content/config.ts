import { z, defineCollection, reference } from 'astro:content';

const projectsCollection = defineCollection({
  schema: () =>
    z.discriminatedUnion('type', [
      z.object({
        type: z.literal('npm'),
        title: z.string(),
        link: z.string().url(),
        order: z.number(),
      }),
      z.object({
        type: z.literal('github'),
        title: z.string(),
        link: z.string().url(),
        order: z.number(),
      }),
      z.object({
        type: z.literal('codepen'),
        title: z.string(),
        pen: z.string(),
        order: z.number(),
      }),
    ]),
});

const thoughtsCollection = defineCollection({
  schema: () =>
    z.object({
      summary: z.string(),
      date: z.date(),
      status: z
        .enum(['thinking', 'active', 'paused', 'finished', 'abandoned'])
        .default('thinking'),
    }),
});

const blogCollection = defineCollection({
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string().optional(),
      pubDate: z.date().optional(),
      authorDate: z.date().optional(),
      tags: z.array(z.string()).default([]),
      image: z
        .object({
          src: image(),
          alt: z.string(),
        })
        .optional(),
    }),
});

const sci0GamesCollection = defineCollection({
  type: 'data',
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      year: z.number(),
      engine: z.enum(['sci0', 'sci01']),
      aspectRatio: z.enum(['1:1.2', '1:1']),
      cover: image(),
    }),
});

const sci0PicsCollection = defineCollection({
  type: 'data',
  schema: ({ image }) =>
    z.object({
      game: reference('sci0games'),
      pic: z.number().int(),
      compression: z.number(),
      content: z.string(),
      thumbnail: image(),
      thumbnailAlt: z.string(),
      description: z.string().optional(),
    }),
});

export const collections = {
  blog: blogCollection,
  sci0pics: sci0PicsCollection,
  sci0games: sci0GamesCollection,
  thoughts: thoughtsCollection,
  projects: projectsCollection,
};
