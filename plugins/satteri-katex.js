import katex from 'katex';
import { defineMdastPlugin } from 'satteri';

const ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
};

const escapeHtml = (value) => value.replace(/[&<>"']/g, (c) => ESCAPES[c] ?? c);

const preserveBackslashes = (html) => html.replace(/\\/g, '\\\\');

export function satteriKatex(options = {}) {
  const render = (tex, displayMode) => {
    try {
      const rendered = katex.renderToString(tex, {
        output: 'htmlAndMathml',
        throwOnError: true,
        ...options,
        displayMode,
      });
      return { raw: preserveBackslashes(rendered), mdxExpressions: false };
    } catch (error) {
      return {
        raw: preserveBackslashes(escapeHtml(String(error))),
        mdxExpressions: false,
      };
    }
  };

  return defineMdastPlugin({
    name: 'satteri-katex',
    math: (node) => render(node.value, true),
    inlineMath: (node) => render(node.value, false),
  });
}
