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
  maximize: boolean;
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
  } = props;

  const updateFnRef = useRef<((pixels: ImageDataLike) => void) | undefined>(
    undefined,
  );

  const init = useCallback((canvasEl: HTMLCanvasElement | null) => {
    if (canvasEl === null) {
      updateFnRef.current = undefined;
      return;
    }

    const ctx = canvasEl.getContext('bitmaprenderer')!;

    let imgData: ImageData;
    updateFnRef.current = ({ data, width, height }: ImageDataLike) => {
      const uninitialized =
        !imgData || imgData.width !== width || imgData.height !== height;

      if (uninitialized) {
        canvasEl.width = width;
        canvasEl.height = height;
        imgData = new ImageData(width, height);
      }
      imgData.data.set(data);
      createImageBitmap(imgData).then((it) => ctx.transferFromImageBitmap(it));
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
        className={clsn(styles.canvas, maximize && styles.maximize)}
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
