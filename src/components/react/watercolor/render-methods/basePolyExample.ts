import * as M from 'transformation-matrix';

import type { ExampleRenderer } from '@components/react/watercolor/render-methods/example-renderer.ts';
import {
  nGon,
  poly,
} from '@components/react/watercolor/render-methods/helpers.ts';

export const basePolyExample = (
  ctx: CanvasRenderingContext2D,
): ExampleRenderer => {
  const { width, height } = ctx.canvas;
  const hex = M.applyToPoints(M.compose(M.scale(height * 0.4)), nGon(6));

  return {
    render: () => {
      ctx.save();
      ctx.clearRect(0, 0, width, height);

      const viewMatrix = M.translate(width / 2, height / 2);
      ctx.setTransform(viewMatrix);
      ctx.beginPath();
      poly(ctx, hex);
      ctx.fillStyle = 'rgba(0 0 0 / 25%)';
      ctx.fill();
      ctx.restore();
    },
  };
};
