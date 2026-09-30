import GithubSlugger from 'github-slugger';
import { defineHastPlugin, type HastPluginDefinition } from 'satteri';

export type SatteriSlugOptions = {
  readonly prefix?: string;
  readonly headingLevels?: {
    [level in 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6']?: boolean;
  };
};

export const satteriSlugger = (
  options: SatteriSlugOptions = {},
): HastPluginDefinition => {
  const { prefix = '', headingLevels = {} } = options;
  const filter = (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).filter(
    (it) => headingLevels[it] ?? true,
  );

  return () => {
    const slugger = new GithubSlugger();

    return defineHastPlugin({
      name: 'satteri-slugger',
      element: {
        filter,
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
