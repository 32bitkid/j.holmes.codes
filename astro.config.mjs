import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import ViteYaml from '@modyfi/vite-plugin-yaml';
import rehypeKatex from 'rehype-katex';
import remarkHint from 'remark-hint';
import remarkCapitalizeHeading from 'remark-capitalize-headings';

// https://astro.build/config
export default defineConfig({
  site: 'https://j.holmes.codes',
  integrations: [mdx()],
  vite: {
    plugins: [ViteYaml()],
  },
  markdown: {
    remarkPlugins: [remarkMath, remarkHint, remarkCapitalizeHeading],
    rehypePlugins: [[rehypeKatex, {}]],
    shikiConfig: {
      theme: 'monokai',
      wrap: true,
    },
  },
});
