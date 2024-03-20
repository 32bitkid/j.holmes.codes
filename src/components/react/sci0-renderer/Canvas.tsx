import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  type Dispatch,
  type SetStateAction,
  type MouseEvent,
} from 'react';
import {
  renderPic,
  type DrawCommand,
  type FilterPipeline,
} from '@4bitlabs/sci0';
import { type ImageDataLike } from '@4bitlabs/image';
import debounce from 'lodash.debounce';

import { PIXEL_ASPECT_RATIOS } from '@components/react/sci0-renderer/options.ts';
import styles from './sci0-renderer.module.css';
import { createRenderGL } from './webgl-render.ts';
import { createRender2d } from './2d-render.ts';
import { type RenderMode } from './types.ts';

export interface RenderCanvasProps {
  picData: DrawCommand[];
  limit?: number;
  label: string;
  pixelAspectRatio: keyof typeof PIXEL_ASPECT_RATIOS;
  renderPipeline: FilterPipeline;
  maximize: boolean;
  onChangeMaximize: Dispatch<SetStateAction<boolean>>;
  mode: RenderMode;
}

const useTicker = (): [unknown, () => void] => {
  const [tick, setTick] = useState({});
  return [tick, useCallback(() => setTick({}), [setTick])];
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
    onChangeMaximize,
    mode: [mode, modeOptions],
    label,
  } = props;

  const [resized, onResized] = useTicker();
  const unobserveFnRef = useRef<(() => void) | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const updateFnRef = useRef<
    ((pixels: ImageDataLike, options?: Record<string, any>) => void) | null
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
      updateFnRef.current = {
        '2d': createRender2d,
        webgl2: createRenderGL,
      }[mode](canvasEl);
    },
    [mode],
  );

  useEffect(() => {
    let updateFn = updateFnRef.current;
    if (!updateFn) return;

    const actual = picData.slice(0, limit);
    const { visible } = renderPic(actual, { pipeline: renderPipeline });
    updateFn(visible, modeOptions);
  }, [picData, limit, renderPipeline, updateFnRef, mode, modeOptions, resized]);

  const handleChangeMaximize = useCallback(
    (e: MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      if (canvasRef.current) {
        canvasRef.current.requestFullscreen({});
      }
    },
    [onChangeMaximize],
  );

  return (
    <>
      <canvas
        key={mode}
        role="img"
        aria-label={label}
        className={clsn(styles.canvas, maximize && styles.maximize)}
        ref={init}
        style={{
          aspectRatio: PIXEL_ASPECT_RATIOS[pixelAspectRatio],
        }}
        onDoubleClick={handleChangeMaximize}
      >
        Canvas not supported…
      </canvas>
    </>
  );
}
