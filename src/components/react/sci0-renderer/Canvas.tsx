import React, { useRef, useEffect, useCallback } from 'react';
import {
  renderPic,
  type DrawCommand,
  type FilterPipeline,
} from '@4bitlabs/sci0';
import { type ImageDataLike } from '@4bitlabs/image';

import { PIXEL_ASPECT_RATIOS } from '@components/react/sci0-renderer/options.ts';
import styles from './sci0-renderer.module.css';

export interface RenderCanvasProps {
  picData: DrawCommand[];
  limit?: number;
  pixelAspectRatio: keyof typeof PIXEL_ASPECT_RATIOS;
  renderPipeline: FilterPipeline;
}

export function Canvas(props: RenderCanvasProps) {
  const {
    picData,
    renderPipeline,
    limit = Number.POSITIVE_INFINITY,
    pixelAspectRatio,
  } = props;

  const updateFnRef = useRef<((pixels: ImageDataLike) => void) | undefined>(
    undefined,
  );

  const init = useCallback((canvasEl: HTMLCanvasElement | null) => {
    if (canvasEl === null) {
      updateFnRef.current = undefined;
      return;
    }

    const ctx = canvasEl.getContext('2d')!;

    let imgData: ImageData;
    updateFnRef.current = (pixels: ImageDataLike) => {
      const uninitialized =
        !imgData ||
        canvasEl.width !== pixels.width ||
        canvasEl.height !== pixels.height;

      if (uninitialized) {
        canvasEl.width = pixels.width;
        canvasEl.height = pixels.height;
        imgData = ctx.createImageData(pixels.width, pixels.height);
      }

      imgData.data.set(pixels.data);
      ctx.putImageData(imgData, 0, 0);
    };
  }, []);

  useEffect(() => {
    const updateFn = updateFnRef.current;
    if (!updateFn) return;
    const actual = picData.slice(0, limit);
    const { visible } = renderPic(actual, { pipeline: renderPipeline });
    updateFn(visible);
  }, [picData, limit, renderPipeline]);

  return (
    <>
      <canvas
        className={styles.canvas}
        ref={init}
        style={{
          aspectRatio: PIXEL_ASPECT_RATIOS[pixelAspectRatio],
        }}
      >
        Canvas not supported…
      </canvas>
    </>
  );
}
