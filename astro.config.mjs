import mdx from "@astrojs/mdx";
import { defineConfig } from 'astro/config';
import remarkMath from "remark-math";
import ViteYaml from '@modyfi/vite-plugin-yaml';
import rehypeKatex from "rehype-katex";


// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  vite: {
    plugins: [ViteYaml()],
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [[rehypeKatex, {}]],
    shikiConfig: {
      theme: "monokai",
      wrap: true
    }
  }
});