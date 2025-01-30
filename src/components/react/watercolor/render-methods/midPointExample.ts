import { effect, signal } from '@preact/signals-core';
import { distortPolygon } from '@watercolorizer/watercolorizer/distort-polygon';
import * as M from 'transformation-matrix';

import { clamp } from '@utils/maths.ts';
import type { ExampleRenderer } from './example-renderer.ts';
import { nGon, poly, text } from './helpers.ts';

export const midPointExample = (
  ctx: CanvasRenderingContext2D,
): ExampleRenderer => {
  const el = ctx.canvas;
  const { width, height } = ctx.canvas;
  const hex = M.applyToPoints(M.compose(M.scale(height * 0.4)), nGon(6));

  const pos = signal(el.width / 2);

  let lastTick = 0;

  const update = (value: number) => {
    lastTick = 0;

    ctx.resetTransform();
    ctx.clearRect(0, 0, width, height);

    const viewMatrix = M.translate(width / 2, height / 2);
    ctx.setTransform(viewMatrix);
    ctx.beginPath();
    poly(ctx, hex);
    ctx.fillStyle = 'rgba(0 0 0 / 25%)';
    ctx.fill();

    const t = clamp(0.001, 0.999, 1 - Math.abs(value / width));

    {
      const [distorted] = distortPolygon([hex, Array(6).fill(1)], {
        blurWeightsOnDistort: false,
        wiggle: false,
        midPointFn: () => t,
        thetaFn: () => 0,
        magnitudeFn: () => 0,
      });

      ctx.strokeStyle = 'rgba(255 0 0 / 100%)';
      const [a, c, b] = distorted;
      ctx.beginPath();
      ctx.arc(...c, 4, 0, Math.PI * 2);
      ctx.stroke();

      text(ctx, a, `A`, [5, 0]);
      text(ctx, b, `B`, [0, -5]);
      text(ctx, c, `\u{1D461} = ${t.toFixed(3)}`, [8, -8]);
    }
  };

  const handleMove = (e: PointerEvent) => (pos.value = e.offsetX);

  el.addEventListener('pointermove', handleMove);

  const teardown = effect(() => {
    if (lastTick) cancelAnimationFrame(lastTick);
    const value = pos.value;
    lastTick = requestAnimationFrame(() => update(value));
  });

  return {
    render: () => update(pos.value),
    teardown() {
      el.removeEventListener('pointermove', handleMove);
      teardown();
    },
  };
};
