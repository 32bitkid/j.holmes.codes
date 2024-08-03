import { gaussRng } from '@utils/maths.ts';
import type { ExampleRenderer } from './example-renderer.ts';
import { text } from './helpers.ts';

export const gaussDotsExample = (
  ctx: CanvasRenderingContext2D,
): ExampleRenderer => {
  const { width, height } = ctx.canvas;
  const render = () => {
    ctx.save();
    ctx.clearRect(0, 0, width, height);

    text(ctx, [0, height - 10], 'Click to randomize');

    const sigma = Math.min(width, height) / 6;

    ctx.fillStyle = 'rgba(0 0 0 / 50%)';
    for (let i = 0; i < 1000; i++) {
      const [x, y] = [gaussRng(width / 2, sigma), gaussRng(height / 2, sigma)];
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  ctx.canvas.addEventListener('click', render);

  return {
    render,
    teardown: () => {
      ctx.canvas.removeEventListener('click', render);
    },
  };
};
