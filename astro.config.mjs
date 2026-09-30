import { satteri } from '@astrojs/markdown-satteri';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import ViteYaml from '@modyfi/vite-plugin-yaml';
import { defineConfig, fontProviders } from 'astro/config';
import { satteriCapitalizeTitles } from './plugins/satteri-capitalize-titles.ts';
import { satteriKatex } from './plugins/satteri-katex.js';
import { satteriSlugger } from './plugins/satteri-slugger.ts';

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
          headingLevels: { h1: false },
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
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Equity Text B',
      cssVariable: '--font-equity-text',
      options: {
        variants: [
          {
            weight: 400,
            style: 'normal',
            src: [
              './src/assets/fonts/equity/equity_text_b_regular-webfont.woff2',
              './src/assets/fonts/equity/equity_text_b_regular-webfont.woff',
            ],
            featureSettings: '"ss01" 1, "calt" 1, "liga" 1',
          },
          {
            weight: 400,
            style: 'italic',
            src: [
              './src/assets/fonts/equity/equity_text_b_italic-webfont.woff2',
              './src/assets/fonts/equity/equity_text_b_italic-webfont.woff',
            ],
            featureSettings: '"ss01" 1, "calt" 1, "liga" 1',
          },
          {
            weight: 700,
            style: 'normal',
            src: [
              './src/assets/fonts/equity/equity_text_b_bold-webfont.woff2',
              './src/assets/fonts/equity/equity_text_b_bold-webfont.woff',
            ],
            featureSettings: '"ss01" 1, "calt" 1, "liga" 1',
          },
          {
            weight: 700,
            style: 'italic',
            src: [
              './src/assets/fonts/equity/equity_text_b_bold_italic-webfont.woff2',
              './src/assets/fonts/equity/equity_text_b_bold_italic-webfont.woff',
            ],
            featureSettings: '"ss01" 1, "calt" 1, "liga" 1',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Equity Caps B',
      cssVariable: '--font-equity-caps',
      options: {
        variants: [
          {
            weight: 400,
            style: 'normal',
            src: [
              './src/assets/fonts/equity/equity_caps_b_regular-webfont.woff2',
              './src/assets/fonts/equity/equity_caps_b_regular-webfont.woff',
            ],
            featureSettings: '"ss01" 1, "calt" 1, "onum" 1',
          },
          {
            weight: 700,
            style: 'normal',
            src: [
              './src/assets/fonts/equity/equity_caps_b_bold-webfont.woff2',
              './src/assets/fonts/equity/equity_caps_b_bold-webfont.woff',
            ],
            featureSettings: '"ss01" 1, "calt" 1, "onum" 1',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Fira Code VF',
      cssVariable: '--font-fira-code-vf',
      options: {
        variants: [
          {
            weight: [300, 700],
            style: 'normal',
            src: [
              './src/assets/fonts/firacode/FiraCode-VF.woff2',
              './src/assets/fonts/firacode/FiraCode-VF.woff',
            ],
            featureSettings: '"ss08", "ss03", "cv14", "cv01"',
          },
          {
            weight: [300, 700],
            style: 'italic',
            src: [
              './src/assets/fonts/firacode/FiraCode-VF.woff2',
              './src/assets/fonts/firacode/FiraCode-VF.woff',
            ],
            featureSettings: '"ss08", "ss03", "cv14", "cv01"',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'SciAC FONT.000',
      cssVariable: '--font-sci-000',
      options: {
        variants: [
          {
            weight: 400,
            style: 'normal',
            src: ['./src/assets/fonts/sciAC/sciAC-font-000.woff2'],
            featureSettings: "'dlig' 1",
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'SciAC FONT.001',
      cssVariable: '--font-sci-001',
      options: {
        variants: [
          {
            weight: 400,
            style: 'normal',
            src: ['./src/assets/fonts/sciAC/sciAC-font-001.woff2'],
            featureSettings: "'dlig' 1",
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'SciAC FONT.004',
      cssVariable: '--font-sci-004',
      options: {
        variants: [
          {
            weight: 400,
            style: 'normal',
            src: ['./src/assets/fonts/sciAC/sciAC-font-004.woff2'],
            featureSettings: "'dlig' 1",
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'SciAC FONT.300',
      cssVariable: '--font-sci-300',
      options: {
        variants: [
          {
            weight: 400,
            style: 'normal',
            src: ['./src/assets/fonts/sciAC/sciAC-font-300.woff2'],
            featureSettings: "'dlig' 1",
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'SciAC FONT.999',
      cssVariable: '--font-sci-999',
      options: {
        variants: [
          {
            weight: 400,
            style: 'normal',
            src: ['./src/assets/fonts/sciAC/sciAC-font-999.woff2'],
            featureSettings: "'dlig' 1",
          },
        ],
      },
    },
  ],
});
