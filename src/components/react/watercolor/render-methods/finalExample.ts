import { watercolorize } from '@watercolorizer/watercolorizer';
import * as M from 'transformation-matrix';

import type { ExampleRenderer } from './example-renderer.ts';
import { nGon, poly, text } from './helpers.ts';

const colors = [
  '#0000000a',
  '#1D2B530a',
  '#7E25530a',
  '#0087510a',
  '#AB52360a',
  '#5F574F0a',
  '#FF004D0a',
  '#FFA3000a',
  '#FFEC270a',
  '#00E4360a',
  '#29ADFF0a',
  '#83769C0a',
  '#FF77A80a',
];

export const finalExample = (
  ctx: CanvasRenderingContext2D,
): ExampleRenderer => {
  const el = ctx.canvas;
  const { width, height } = ctx.canvas;
  const hex = M.applyToPoints(M.compose(M.scale(height * 0.4)), nGon(6));

  const update = () => {
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    text(ctx, [0, height - 10], 'Click to randomize');

    const viewMatrix = M.translate(width / 2, height / 2);
    ctx.setTransform(viewMatrix);

    const currentColor = colors[Math.floor(Math.random() * colors.length)];
    ctx.fillStyle = currentColor;
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 2;
    for (const layer of watercolorize(hex, {
      blurWeightsOnDistort: true,
      simplifyAfterPreEvolution: 1,
      vertexWeights: Array.from({ length: 6 }, () => Math.random()),
    })) {
      ctx.beginPath();
      poly(ctx, layer);
      ctx.fill();
      if (Math.random() < 0.25) {
        ctx.lineWidth = Math.random() + 1;
        ctx.stroke();
      }
    }

    ctx.beginPath();
    poly(ctx, hex);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255 255 255 / 33%)';
    ctx.stroke();

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
