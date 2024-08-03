import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import ViteYaml from '@modyfi/vite-plugin-yaml';
import rehypeKatex from 'rehype-katex';
import remarkHint from 'remark-hint';
import remarkCapitalizeHeading from 'remark-capitalize-headings';
import {
  remarkDefinitionList,
  defListHastHandlers,
} from 'remark-definition-list';

// https://astro.build/config
export default defineConfig({
  site: 'https://j.holmes.codes',
  scopedStyleStrategy: 'class',
  integrations: [mdx(), react({ include: 'components/react/**/*' })],
  vite: { plugins: [ViteYaml()] },
  markdown: {
    smartypants: false,
    remarkPlugins: [
      remarkMath,
      remarkHint,
      [remarkCapitalizeHeading, { excludeHeadingLevel: { h1: true } }],
      [remarkDefinitionList, {}],
    ],
    remarkRehype: { handlers: { ...defListHastHandlers } },
    rehypePlugins: [[rehypeKatex, {}]],
    shikiConfig: {
      theme: 'monokai',
      wrap: true,
    },
  },
});
