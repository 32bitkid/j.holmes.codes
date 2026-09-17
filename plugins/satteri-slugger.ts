import GithubSlugger from 'github-slugger';
import { defineHastPlugin, type HastPluginDefinition } from 'satteri';

export type SatteriSlugOptions = {
  readonly prefix?: string;
};

export const satteriSlugger = (
  options: SatteriSlugOptions = {},
): HastPluginDefinition => {
  const { prefix = '' } = options;
  return () => {
    const slugger = new GithubSlugger();

    return defineHastPlugin({
      name: 'satteri-slugger',
      element: {
        filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        visit(node, ctx) {
          if (node.properties?.id !== undefined) return;

          ctx.setProperty(
            node,
            'id',
            prefix + slugger.slug(ctx.textContent(node)),
          );
        },
      },
    });
  };
};
