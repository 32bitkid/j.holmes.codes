import { defineConfig } from 'astro/config';
import remarkMath from "remark-math";

import mdx from "@astrojs/mdx";
import rehypeKatex from "rehype-katex";

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [[rehypeKatex, {}]],
    shikiConfig: {
      theme: "monokai",
      wrap: true
    }
  }
});