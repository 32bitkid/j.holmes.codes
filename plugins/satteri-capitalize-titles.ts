import { defineMdastPlugin, type MdastNode } from 'satteri';
import title from 'title';

export interface SatteriCapitalizeTitlesOptions {
  excludeHeadingLevel?: {
    h1?: boolean;
    h2?: boolean;
    h3?: boolean;
    h4?: boolean;
    h5?: boolean;
    h6?: boolean;
  };
  special?: string[];
}

export function satteriCapitalizeTitles(
  options: SatteriCapitalizeTitlesOptions = {},
) {
  const { excludeHeadingLevel: ehl, special } = options;
  const excludes = [
    undefined,
    ehl?.h1 ?? false,
    ehl?.h2 ?? false,
    ehl?.h3 ?? false,
    ehl?.h4 ?? false,
    ehl?.h5 ?? false,
    ehl?.h6 ?? false,
  ];

  return defineMdastPlugin({
    name: 'satteri-capitalize-titles',
    heading: (root, ctx) => {
      if (excludes[root.depth]) return;

      let headingText = '';
      const textNodes = new Map<
        Extract<MdastNode, { type: 'text' }>,
        [number, number]
      >();

      const nodes: MdastNode[] = [...root.children];
      while (true) {
        const node = nodes.shift();
        if (!node) break;

        if (node.type === 'text') {
          textNodes.set(node, [
            headingText.length,
            headingText.length + node.value.length,
          ]);
          headingText += node.value;
        }

        if ('children' in node) {
          nodes.unshift(...node.children);
        }
      }

      const titleText = title(headingText, { special });
      for (const [node, [start, end]] of textNodes.entries()) {
        ctx.setProperty(node, 'value', titleText.substring(start, end));
      }
    },
  });
}
