import { defineCollection, reference, z } from 'astro:content';

const tilsCollection = defineCollection({
  type: 'content',
  schema: () =>
    z.object({
      category: z.string().default('general'),
      summary: z.string(),
      when: z.date(),
    }),
});

const projectsCollection = defineCollection({
  type: 'content',
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
  type: 'content',
  schema: () =>
    z.object({
      summary: z.string(),
      date: z.date(),
      status: z
        .enum(['thinking', 'active', 'paused', 'finished', 'abandoned'])
        .default('thinking'),
    }),
});

const blogMeta = z.object({
  title: z.string(),
  summary: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

const blogCollection = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.discriminatedUnion('published', [
      z
        .object({
          authorDate: z.date(),
          published: z.literal(true),
          image: z
            .object({
              src: image(),
              alt: z.string(),
            })
            .optional(),
        })
        .merge(blogMeta),
      z
        .object({
          authorDate: z.date().optional(),
          published: z.literal(false).optional(),
          image: z
            .object({
              src: image(),
              alt: z.string(),
            })
            .optional(),
        })
        .merge(blogMeta),
    ]),
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

const recipesCollection = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      description: z.string().optional(),
      servings: z.string().optional(),
      thumbnail: z
        .object({
          image: image(),
          alt: z.string(),
        })
        .optional(),
    }),
});

export const collections = {
  blog: blogCollection,
  projects: projectsCollection,
  sci0games: sci0GamesCollection,
  sci0pics: sci0PicsCollection,
  thoughts: thoughtsCollection,
  TILs: tilsCollection,
  recipes: recipesCollection,
};
