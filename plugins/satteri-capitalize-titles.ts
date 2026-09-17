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

function exists<T>(it: T | null | undefined): T {
  if (it === null || it === undefined) throw new Error('value expected');
  return it;
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

      const walk = (children: MdastNode[]) => {
        for (const node of children) {
          if (!node) continue;
          if (node?.type === 'text') {
            textNodes.set(node, [
              headingText.length,
              headingText.length + node.value.length,
            ]);
            headingText += node.value;
          }
          if ('children' in node) {
            walk(node.children);
          }
        }
      };

      walk(root.children);
      const titleText = title(headingText, { special });
      for (const [node, [start, end]] of textNodes.entries()) {
        ctx.setProperty(node, 'value', titleText.substring(start, end));
      }
    },
  });
}
