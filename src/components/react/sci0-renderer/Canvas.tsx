import { createCrtRenderer } from '@4bitlabs/crt-lite';
import {
  type ImageDataLike,
  type RenderPipeline,
  renderPixelData,
} from '@4bitlabs/image';
import type { DrawCommand } from '@4bitlabs/sci0';
import { renderPic } from '@4bitlabs/sci0-renderer';
import debounce from 'lodash.debounce';
import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  type MouseEvent,
} from 'react';

import { PIXEL_ASPECT_RATIOS } from '@components/react/sci0-renderer/options.ts';
import { createRender2d } from './2d-render.ts';
import styles from './sci0-renderer.module.css';
import type { RenderMode } from './types.ts';

export interface RenderCanvasProps {
  picData: DrawCommand[];
  limit?: number;
  label: string;
  pixelAspectRatio: keyof typeof PIXEL_ASPECT_RATIOS;
  renderPipeline: RenderPipeline;
  maximize: boolean;
  mode: RenderMode;
}

const useTicker = (): [unknown, () => void] => {
  const [tick, setTick] = useState({});
  return [tick, useCallback(() => setTick({}), [])];
};

const clsn = (...items: (string | undefined | false)[]) =>
  items.filter((it) => it).join(' ');

export function Canvas(props: RenderCanvasProps) {
  const {
    picData,
    renderPipeline,
    limit = Number.POSITIVE_INFINITY,
    pixelAspectRatio,
    maximize,
    mode: [mode, modeOptions],
    label,
  } = props;

  const [resized, onResized] = useTicker();
  const unobserveFnRef = useRef<(() => void) | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const updateFnRef = useRef<
    ((pixels: ImageDataLike, options?: RenderMode[1]) => void) | null
  >(null);

  const init = useCallback(
    (canvasEl: HTMLCanvasElement | null) => {
      if (canvasEl === null) {
        if (unobserveFnRef.current) unobserveFnRef.current();
        canvasRef.current = null;
        unobserveFnRef.current = null;
        updateFnRef.current = null;
        return;
      }

      canvasRef.current = canvasEl;
      const resizeObserver = new ResizeObserver(
        debounce(() => onResized(), 125, { leading: false, maxWait: 500 }),
      );
      resizeObserver.observe(canvasEl);

      unobserveFnRef.current = () => {
        resizeObserver.unobserve(canvasEl);
        resizeObserver.disconnect();
      };

      const { update } = {
        '2d': createRender2d,
        webgl2: createCrtRenderer,
      }[mode](canvasEl);

      updateFnRef.current = update;
    },
    [mode, onResized],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies(mode): rerender on mode change
  // biome-ignore lint/correctness/useExhaustiveDependencies(resized): rerender on resized
  useEffect(() => {
    const updateFn = updateFnRef.current;
    if (!updateFn) return;

    const actual = picData.slice(0, limit);
    const { visible } = renderPic(actual);
    const imgData = renderPixelData(visible, renderPipeline);
    updateFn(imgData, modeOptions);
  }, [picData, limit, renderPipeline, mode, modeOptions, resized]);

  const handleChangeMaximize = useCallback(
    (e: MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      if (canvasRef.current) {
        canvasRef.current
          .requestFullscreen({})
          .catch(() => console.error('unable to switch to fullscreen canvas'));
      }
    },
    [],
  );

  return (
    <>
      <canvas
        key={mode}
        role="img"
        aria-label={label}
        className={clsn(styles.canvas, maximize && styles.maximize)}
        ref={init}
        style={{ aspectRatio: PIXEL_ASPECT_RATIOS[pixelAspectRatio] }}
        onDoubleClick={handleChangeMaximize}
      >
        Canvas not supported…
      </canvas>
    </>
  );
}
