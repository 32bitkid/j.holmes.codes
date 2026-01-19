import { clamp, gaussRng } from '@utils/maths.ts';
import { distortPolygon } from '@watercolorizer/watercolorizer/distort-polygon';
import * as M from 'transformation-matrix';
import type { ExampleRenderer } from './example-renderer.ts';
import { nGon, poly, text } from './helpers.ts';

export const rngExample = (ctx: CanvasRenderingContext2D): ExampleRenderer => {
  const el = ctx.canvas;
  const { width, height } = ctx.canvas;
  const hex = M.applyToPoints(M.compose(M.scale(height * 0.4)), nGon(6));

  const update = () => {
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    text(ctx, [0, height - 10], 'Click to randomize');

    const viewMatrix = M.translate(width / 2, height / 2);

    ctx.setTransform(viewMatrix);

    const [distorted] = distortPolygon([hex, Array(6).fill(1)], {
      blurWeightsOnDistort: false,
      wiggle: false,
      magnitudeFn: (len) => Math.abs(gaussRng(0, len / 8)),
      thetaFn: () => gaussRng(0, Math.PI / 12),
      midPointFn: () => clamp(0.001, 0.999, gaussRng(0.5, 0.4 / 3)),
    });
    poly(ctx, distorted);
    ctx.fillStyle = 'rgba(255 0 0 / 25%)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255 0 0 / 75%)';
    ctx.stroke();

    ctx.beginPath();
    poly(ctx, hex);
    ctx.fillStyle = 'rgba(0 0 0 / 25%)';
    ctx.fill();

    ctx.restore();
  };

  el.addEventListener('click', update);

  return {
    render: () => update(),
    teardown() {
      el.removeEventListener('click', update);
    },
  };
};
