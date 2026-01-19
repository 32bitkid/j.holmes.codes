import RenderMethods from '@components/react/watercolor/render-methods';
import { useEffect, useRef } from 'react';

const NOOP = () => {};

function clear(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  try {
    ctx.resetTransform();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  } finally {
    ctx.restore();
  }
}

interface WatercolorExplorerProps {
  renderFn: keyof typeof RenderMethods;
}

export function WatercolorExplorer(props: WatercolorExplorerProps) {
  const { renderFn } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const updateFn = useRef<() => void>(NOOP);
  const teardownFn = useRef<() => void>(NOOP);

  useEffect(() => {
    const el = canvasRef.current;
    if (el === null) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;

    const { render, teardown = NOOP } = RenderMethods[renderFn](ctx);

    render();
    teardownFn.current = teardown;
    updateFn.current = render;

    return () => {
      updateFn.current = NOOP;
      teardownFn.current();
      teardownFn.current = NOOP;
      clear(ctx);
    };
  }, [renderFn]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={300}
      style={{
        display: 'block',
        width: '100%',
        maxWidth: '600px',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: '1lh',
      }}
    >
      Canvas is not supported
    </canvas>
  );
}
