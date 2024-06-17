import * as M from 'transformation-matrix';
import { watercolorize } from '@watercolorizer/watercolorizer';

import type { ExampleRenderer } from './example-renderer.ts';
import { nGon, poly, text } from './helpers.ts';

const colors = [
  `#0000000a`,
  `#1D2B530a`,
  `#7E25530a`,
  `#0087510a`,
  `#AB52360a`,
  `#5F574F0a`,
  `#FF004D0a`,
  `#FFA3000a`,
  `#FFEC270a`,
  `#00E4360a`,
  `#29ADFF0a`,
  `#83769C0a`,
  `#FF77A80a`,
];

export const finalExample = (
  ctx: CanvasRenderingContext2D,
): ExampleRenderer => {
  const el = ctx.canvas;

  const update = () => {
    const { width, height } = ctx.canvas;

    ctx.reset();
    ctx.clearRect(0, 0, width, height);
    text(ctx, [0, height - 10], 'Click to randomize');

    const hex = M.applyToPoints(M.compose(M.scale(height * 0.4)), nGon(6));

    const viewMatrix = M.translate(width / 2, height / 2);

    ctx.setTransform(viewMatrix);

    const currentColor = colors[Math.floor(Math.random() * colors.length)];
    for (const layer of watercolorize(hex, {
      blurWeightsOnDistort: true,
      simplifyAfterPreEvolution: 1,
      vertexWeights: Array.from({ length: 6 }, () => Math.random()),
    })) {
      ctx.beginPath();
      poly(ctx, layer);
      ctx.fillStyle = currentColor;
      ctx.fill();
    }

    ctx.beginPath();
    poly(ctx, hex);
    ctx.strokeStyle = 'rgba(255 255 255 / 33%)';
    ctx.stroke();
  };

  el.addEventListener('click', update);

  return {
    render: () => update(),
    teardown() {
      el.removeEventListener('click', update);
    },
  };
};
