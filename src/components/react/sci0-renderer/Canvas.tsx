import React, {
  useRef,
  useEffect,
  useCallback,
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

import { PIXEL_ASPECT_RATIOS } from '@components/react/sci0-renderer/options.ts';
import styles from './sci0-renderer.module.css';
import { createRenderGL } from './webgl-render.ts';

export interface RenderCanvasProps {
  picData: DrawCommand[];
  limit?: number;
  pixelAspectRatio: keyof typeof PIXEL_ASPECT_RATIOS;
  renderPipeline: FilterPipeline;
  maximize: boolean;
  onChangeMaximize: Dispatch<SetStateAction<boolean>>;
}

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
  } = props;

  const updateFnRef = useRef<((pixels: ImageDataLike) => void) | undefined>(
    undefined,
  );

  const init = useCallback((canvasEl: HTMLCanvasElement | null) => {
    if (canvasEl === null) {
      updateFnRef.current = undefined;
      return;
    }
    updateFnRef.current = createRenderGL(canvasEl);
  }, []);

  useEffect(() => {
    const updateFn = updateFnRef.current;
    if (!updateFn) return;
    const actual = picData.slice(0, limit);
    const { visible } = renderPic(actual, { pipeline: renderPipeline });
    updateFn(visible);
  }, [picData, limit, renderPipeline, updateFnRef]);

  const handleChangeMaximize = useCallback(
    (e: MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      onChangeMaximize((it) => !it);
    },
    [onChangeMaximize],
  );

  return (
    <>
      <canvas
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