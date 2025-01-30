import { lerp as vecLerp } from '@4bitlabs/vec2';
import { effect, signal } from '@preact/signals-core';
import { clamp } from '@utils/maths.ts';
import { distortPolygon } from '@watercolorizer/watercolorizer/distort-polygon';
import * as M from 'transformation-matrix';
import type { ExampleRenderer } from './example-renderer.ts';
import { nGon, poly, text } from './helpers.ts';

export const angleExample = (
  ctx: CanvasRenderingContext2D,
): ExampleRenderer => {
  const el = ctx.canvas;
  const { width, height } = ctx.canvas;
  const hex = M.applyToPoints(M.compose(M.scale(height * 0.4)), nGon(6));

  const pos = signal(el.width / 2);
  let lastTick = 0;

  const update = (value: number) => {
    lastTick = 0;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    const viewMatrix = M.translate(width / 2, height / 2);
    ctx.setTransform(viewMatrix);
    ctx.beginPath();
    poly(ctx, hex);
    ctx.fillStyle = 'rgba(0 0 0 / 25%)';
    ctx.fill();

    const t = 0.345;
    const theta =
      (Math.PI / 2) * (clamp(0.001, 0.999, 1 - Math.abs(value / width)) - 0.5);

    const [[a, c, b]] = distortPolygon([hex, Array(6).fill(1)], {
      blurWeightsOnDistort: false,
      wiggle: false,
      midPointFn: () => t,
      thetaFn: () => theta,
      magnitudeFn: () => 50,
    });

    const mp = vecLerp(a, b, t);
    ctx.strokeStyle = 'rgba(50 50 50 / 50%)';
    ctx.beginPath();
    ctx.arc(...mp, 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.strokeStyle = 'rgba(255 0 0 / 100%)';
    ctx.translate(...mp);
    ctx.rotate(Math.atan2(c[1] - mp[1], c[0] - mp[0]));
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(45, 0);
    ctx.lineTo(40, 4);
    ctx.moveTo(45, 0);
    ctx.lineTo(40, -4);
    ctx.stroke();
    ctx.restore();

    text(ctx, a, `A`, [5, 0]);
    text(ctx, b, `B`, [0, -5]);
    ctx.textAlign = 'right';
    text(ctx, mp, `\u{1D461} = ${t.toFixed(3)}`, [-8, 8]);
    ctx.textAlign = 'left';
    text(ctx, c, `\u{03B8} = ${theta.toFixed(3)}`, [0, 3]);
    ctx.restore();
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
