import type { ExampleRenderer } from './example-renderer.ts';
import { text } from './helpers.ts';

export const uniformDotsExample = (
  ctx: CanvasRenderingContext2D,
): ExampleRenderer => {
  const render = () => {
    const { width, height } = ctx.canvas;
    ctx.resetTransform();
    ctx.clearRect(0, 0, width, height);

    text(ctx, [0, height - 10], 'Click to randomize');

    ctx.fillStyle = 'rgba(0 0 0 / 50%)';
    for (let i = 0; i < 1000; i++) {
      const [x, y] = [Math.random() * width, Math.random() * height];
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  ctx.canvas.addEventListener('click', render);

  return {
    render,
    teardown: () => {
      ctx.canvas.removeEventListener('click', render);
    },
  };
};
