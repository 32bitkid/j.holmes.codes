import React, { useMemo, useState } from 'react';
import { toByteArray } from 'base64-js';
import { decompress, parsePic } from '@4bitlabs/sci0';
import {
  createDitherFilter,
  type RenderPipeline,
  padFilter,
} from '@4bitlabs/image';
import { IBM5153Contrast, toGrayscale } from '@4bitlabs/color';
import { generatePairs } from '@4bitlabs/color/dithers';

import {
  PIXEL_ASPECT_RATIOS,
  PALETTES,
  DITHERS,
  MIXERS,
  SCALERS,
  BLURS,
} from './options.ts';
import { Canvas } from './Canvas.tsx';
import { Controls } from './Controls.tsx';
import {
  DEFAULT_WEBGL2_OPTIONS,
  type RenderMode,
} from '@components/react/sci0-renderer/types.ts';
import styles from '@components/react/sci0-renderer/sci0-renderer.module.css';
import { useNumericCallback } from '@components/react/sci0-renderer/hooks.ts';

interface Sci0RenderProps {
  readonly data: string;
  readonly engine: 'sci0' | 'sci01';
  readonly compression: 0 | 1 | 2;
  readonly initialAspectRatio: '1:1' | '1:1.2';
  readonly label: string;
}

export function Sci0Renderer(props: Sci0RenderProps) {
  const { data, engine, compression, initialAspectRatio, label } = props;

  const picData = useMemo(() => {
    const rawBytes = toByteArray(data);
    const bytes = decompress(engine, compression, rawBytes);
    return parsePic(bytes);
  }, [data, engine, compression]);

  const [maximize, setMaximize] = useState(false);
  const [progress, setProgress] = useState(picData.length);
  const [palette, setPalette] = useState<keyof typeof PALETTES>('CGA');
  const [grayscale, setGrayscale] = useState(false);
  const [mixer, setMixer] = useState<keyof typeof MIXERS>('none');
  const [contrast, setContrast] = useState<number>(1);
  const [scaler, setScaler] = useState<keyof typeof SCALERS>('(none)');
  const [dither, setDither] = useState<keyof typeof DITHERS>('1:1');
  const [pixelAspectRatio, setPixelAspectRatio] =
    useState<keyof typeof PIXEL_ASPECT_RATIOS>(initialAspectRatio);
  const [postScaler, setPostSCaler] = useState<keyof typeof SCALERS>(
    initialAspectRatio === '1:1' ? '5x5' : '5x6',
  );
  const [blur, setBlur] = useState<keyof typeof BLURS>('(none)');
  const [blurAmount, setBlurAmount] = useState<number>(1);
  const [mode, setMode] = useState<RenderMode>([
    'webgl2',
    DEFAULT_WEBGL2_OPTIONS,
  ]);

  const pipeline = useMemo<RenderPipeline>(() => {
    const basePalette = [
      contrast < 1 && ((pal: Uint32Array) => IBM5153Contrast(pal, contrast)),
      grayscale && toGrayscale,
    ].reduce((pal, fn) => (fn ? fn(pal) : pal), PALETTES[palette]);
    const pairs = generatePairs(basePalette, MIXERS[mixer]);
    return {
      pre: [padFilter([10, 0, 0, 0]), SCALERS[scaler]],
      render: createDitherFilter(pairs, DITHERS[dither]),
      post: [SCALERS[postScaler], BLURS[blur](blurAmount)],
    };
  }, [
    palette,
    grayscale,
    mixer,
    contrast,
    dither,
    scaler,
    postScaler,
    blur,
    blurAmount,
  ]);

  return (
    <>
      <Canvas
        picData={picData}
        limit={progress}
        pixelAspectRatio={pixelAspectRatio}
        renderPipeline={pipeline}
        maximize={maximize}
        mode={mode}
        label={label}
      />
      <div className={styles.progress}>
        <input
          id="progress"
          type="range"
          value={progress}
          min={0}
          max={picData.length}
          onChange={useNumericCallback(setProgress)}
          style={{}}
        />
        <label htmlFor="progress">
          {progress.toLocaleString()} of {picData.length.toLocaleString()}
        </label>
      </div>
      <Controls
        palette={palette}
        grayscale={grayscale}
        mixer={mixer}
        contrast={contrast}
        dither={dither}
        scaler={scaler}
        pixelAspectRatio={pixelAspectRatio}
        postScaler={postScaler}
        blur={blur}
        blurAmount={blurAmount}
        maximize={maximize}
        mode={mode}
        // events
        onChangePalette={setPalette}
        onChangeGrayscale={setGrayscale}
        onChangeMixer={setMixer}
        onChangeContrast={setContrast}
        onChangeDither={setDither}
        onChangeScaler={setScaler}
        onChangePixelAspectRatio={setPixelAspectRatio}
        onChangePostScaler={setPostSCaler}
        onChangeBlur={setBlur}
        onChangeBlurAmount={setBlurAmount}
        onChangeMaximize={setMaximize}
        onChangeMode={setMode}
      />
    </>
  );
}
