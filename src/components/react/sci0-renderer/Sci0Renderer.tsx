import React, { useMemo, useState } from 'react';
import { toByteArray } from 'base64-js';
import { decompress, Pic } from '@4bitlabs/sci0';
import { createDitherizer } from '@4bitlabs/image';
import {
  IBM5153Dimmer,
  generateSciDitherPairs,
  toGrayscale,
} from '@4bitlabs/color';

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
    return Pic.parseFrom(bytes);
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
  const [mode, setMode] = useState<'2d' | 'webgl2'>('webgl2');

  const pipeline = useMemo(() => {
    const basePalette = [
      contrast < 1 && ((pal: Uint32Array) => IBM5153Dimmer(pal, contrast)),
      grayscale && toGrayscale,
    ].reduce((pal, fn) => (fn ? fn(pal) : pal), PALETTES[palette]);
    const pairs = generateSciDitherPairs(basePalette, MIXERS[mixer]);
    return [
      SCALERS[scaler],
      createDitherizer(pairs, DITHERS[dither]),
      SCALERS[postScaler],
      BLURS[blur](blurAmount),
    ];
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
        onChangeMaximize={setMaximize}
        mode={mode}
        label={label}
      />
      <Controls
        maxProgress={picData.length}
        progress={progress}
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
        onChangeProgress={setProgress}
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
