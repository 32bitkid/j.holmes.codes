import { defineMdastPlugin, type MdastNode } from 'satteri';
import title from 'title';

export interface SatteriCapitalizeTitlesOptions {
  readonly headingLevels?: {
    [level in 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6']?: boolean;
  };
  readonly replaceHeadingRegExp?: { [regExp: string]: string };
  readonly special?: string[];
}

export function satteriCapitalizeTitles(
  options: SatteriCapitalizeTitlesOptions = {},
) {
  const { headingLevels: ehl, special } = options;
  const includes = [
    undefined,
    ehl?.h1 ?? true,
    ehl?.h2 ?? true,
    ehl?.h3 ?? true,
    ehl?.h4 ?? true,
    ehl?.h5 ?? true,
    ehl?.h6 ?? true,
  ];

  const compiledReplacements = Object.entries(
    options.replaceHeadingRegExp ?? {},
  ).map<[RegExp, string]>(([regExpStr, value]) => [
    new RegExp(regExpStr, 'gu'),
    value,
  ]);

  const doReplacements = (initial: string) => {
    const length = initial.length;
    let result = initial;
    for (const [regexp, value] of compiledReplacements.values()) {
      const next = result.replace(regexp, value);
      if (next.length !== length) {
        console.warn(
          `replaceHeadingRegExp options must not change the length of the header: "${initial}"`,
        );
      } else {
        result = next;
      }
    }
    return result;
  };

  return defineMdastPlugin({
    name: 'satteri-capitalize-titles',
    heading: (root, ctx) => {
      if (!includes[root.depth]) return;

      let headingText = '';
      const textNodes = new Map<
        Extract<MdastNode, { type: 'text' }>,
        [number, number]
      >();

      const nodes: MdastNode[] = [...root.children];
      while (nodes.length > 0) {
        const node = nodes.shift();
        if (!node) continue;

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

      const titleText = doReplacements(title(headingText, { special }));
      for (const [node, [start, end]] of textNodes.entries()) {
        ctx.setProperty(node, 'value', titleText.substring(start, end));
      }
    },
  });
}
