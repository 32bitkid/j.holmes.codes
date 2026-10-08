import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import titleize from 'title';
import { sciPicAssetLoader } from './loaders/sci-pic-asset-loader.ts';

// sci0games/sci0pics filenames use literal dots as separators (e.g.
// `betrayed-alliance.2013.yaml`) and are cross-referenced by that exact
// string. The default id generation runs filenames through github-slugger,
// which strips dots entirely, breaking those references — so these two
// collections only strip the file extension and keep the rest as-is.
const stripExtension = ({ entry }: { entry: string }) =>
  entry.replace(/\.[^/.]+$/, '');

const tilsCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/TILs' }),
  schema: () =>
    z.object({
      category: z.string().default('general'),
      summary: z.string(),
      when: z.date(),
    }),
});

const projectsCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: () =>
    z.discriminatedUnion('type', [
      z.object({
        type: z.literal('npm'),
        title: z.string(),
        link: z.url(),
        order: z.number(),
      }),
      z.object({
        type: z.literal('github'),
        title: z.string(),
        link: z.url(),
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
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/thoughts' }),
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
  title: z.string().transform((val) => titleize(val)),
  summary: z.string().trim().optional(),
  tags: z.array(z.string()).default([]),
});

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
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
        .extend(blogMeta.shape),
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
        .extend(blogMeta.shape),
    ]),
});

const sci0GamesCollection = defineCollection({
  loader: glob({
    pattern: '**/*.yaml',
    base: './src/content/sci0/games',
    generateId: stripExtension,
  }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      year: z.number(),
      demo: z.boolean().default(false),
      engine: z.enum(['sci0', 'sci01']).default('sci0'),
      aspectRatio: z.enum(['1:1.2', '1:1']),
      cover: image(),
    }),
});

const sci0PicsCollection = defineCollection({
  loader: glob({
    pattern: '**/*.yaml',
    base: './src/content/sci0/pics',
    generateId: stripExtension,
  }),
  schema: ({ image }) =>
    z
      .discriminatedUnion('type', [
        z.object({
          type: z.literal('embedded'),
          compression: z.union([z.literal(0), z.literal(1), z.literal(2)]),
          content: z.preprocess(
            (it) =>
              typeof it === 'string' ? it.replace(/\s/g, '') : undefined,
            z.base64(),
          ),
        }),
        z.object({
          type: z.literal('source'),
          source: reference('sci0data'),
        }),
      ])
      .and(
        z.object({
          pic: z.number().int(),
          game: reference('sci0games'),
          thumbnail: image(),
          thumbnailAlt: z.string(),
          description: z.string().optional(),
        }),
      ),
});

const recipesCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/recipes' }),
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
  sci0data: defineCollection({
    loader: sciPicAssetLoader({
      sources: {
        'qg1-demo': {
          path: './src/assets/sci0',
          resourceName: 'QG1-DEMO',
        },
        'kq1sci-demo': {
          path: './src/assets/sci0',
          resourceName: 'KQ1SCI-DEMO',
        },
        'iceman-demo': {
          path: './src/assets/sci0',
          resourceName: 'ICEMAN-DEMO',
        },
        'lbow1-demo': {
          path: './src/assets/sci0',
          resourceName: 'LBOW1-DEMO',
        },
      },
    }),
  }),
  thoughts: thoughtsCollection,
  TILs: tilsCollection,
  recipes: recipesCollection,
};
