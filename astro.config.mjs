import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import ViteYaml from '@modyfi/vite-plugin-yaml';
import { defineConfig } from 'astro/config';
import { satteriKatex } from './plugins/satteri-katex.js';
import { satteriCapitalizeTitles } from './plugins/satteri-capitalize-titles.ts';
import { satteriSlugger } from './plugins/satteri-slugger.ts';
import { satteri } from '@astrojs/markdown-satteri';

// https://astro.build/config
export default defineConfig({
  site: 'https://j.holmes.codes',
  scopedStyleStrategy: 'class',
  compressHTML: true,
  integrations: [mdx(), react({ include: 'components/react/**/*' })],
  vite: { plugins: [ViteYaml()] },
  markdown: {
    processor: satteri({
      features: {
        math: true,
        definitionList: true,
        directive: true,
      },
      hastPlugins: [satteriSlugger()],
      mdastPlugins: [
        satteriCapitalizeTitles({
          excludeHeadingLevel: { h1: true },
          special: ['TL;DR'],
        }),
        satteriKatex(),
      ],
    }),
    shikiConfig: {
      theme: 'monokai',
      wrap: true,
    },
  },
  redirects: {
    '/thanks': '/support',
  },
});
