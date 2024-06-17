import type { Vec2 } from '@4bitlabs/vec2';
import * as M from 'transformation-matrix';
import { distortPolygon } from '@watercolorizer/watercolorizer/distort-polygon';
import { lerp as vecLerp } from '@4bitlabs/vec2';

import { effect, signal } from '@preact/signals-core';
import { clamp } from '../../../../utils/maths.ts';
import type { ExampleRenderer } from './example-renderer.ts';
import { nGon, odds, poly, text } from './helpers.ts';

export const allSidesExample = (
  ctx: CanvasRenderingContext2D,
): ExampleRenderer => {
  const el = ctx.canvas;
  const pos = signal<Vec2>([el.width / 2, el.height / 2]);

  let lastTick = 0;

  const update = (value: Vec2) => {
    lastTick = 0;
    const { width, height } = ctx.canvas;

    ctx.resetTransform();
    ctx.clearRect(0, 0, width, height);

    const hex = M.applyToPoints(M.compose(M.scale(height * 0.4)), nGon(6));

    const t = clamp(0.001, 0.999, 1 - Math.abs(value[0] / width));
    const theta = 0;
    const d = clamp(0, 1, Math.abs(value[1] / height)) * 50;

    ctx.textAlign = 'left';
    text(ctx, [5, height - 40], `\u{1D461} = ${t.toLocaleString()}`);
    text(ctx, [5, height - 25], `\u{03B8} = ${theta.toLocaleString()}`);
    text(ctx, [5, height - 10], `\u{1D451} = ${d.toLocaleString()}`);

    const viewMatrix = M.translate(width / 2, height / 2);
    ctx.setTransform(viewMatrix);
    ctx.beginPath();
    poly(ctx, hex);
    ctx.fillStyle = 'rgba(0 0 0 / 25%)';
    ctx.fill();

    const [ring] = distortPolygon([hex, Array(6).fill(1)], {
      blurWeightsOnDistort: false,
      wiggle: false,
      midPointFn: () => t,
      thetaFn: () => theta,
      magnitudeFn: () => d,
    });

    for (const [a, b, c] of odds(ring)) {
      ctx.save();
      ctx.fillStyle = 'rgba(255 0 0 / 100%)';
      ctx.beginPath();
      ctx.arc(...b, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(...a);
      ctx.lineTo(...b);
      ctx.lineTo(...c);
      ctx.strokeStyle = 'rgba(50 50 50 / 25%)';
      ctx.stroke();
      ctx.fillStyle = 'rgba(255 0 0 / 20%)';
      ctx.fill();
      ctx.restore();
    }
  };

  const handleMove = (e: PointerEvent) => (pos.value = [e.offsetX, e.offsetY]);
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
