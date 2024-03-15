import React, {
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useState,
} from 'react';
import { toByteArray } from 'base64-js';
import {
  decompress,
  Pic,
  renderPic,
  type DrawCommand,
  type FilterPipeline,
} from '@4bitlabs/sci0';
import { type ImageDataLike, Scalers, createDitherizer } from '@4bitlabs/image';
import {
  DGA_PALETTE,
  IBM5153Dimmer,
  Mixers,
  RAW_CGA,
  TRUE_CGA,
  generateSciDitherPairs,
  toGrayscale,
  type DitherPair,
} from '@4bitlabs/color';

interface RenderCanvasProps {
  picData: DrawCommand[];
  limit?: number;
  renderPipeline: FilterPipeline;
}

const PALETTES = {
  CGA: RAW_CGA,
  TrueCGA: TRUE_CGA,
  DGA: DGA_PALETTE,
  Colly: Uint32Array.of(
    0xff000000,
    0xff770022,
    0xff227700,
    0xff887722,
    0xff330066,
    0xff880077,
    0xff006699,
    0xff997777,
    0xff554444,
    0xffff2233,
    0xff33ff00,
    0xffffee22,
    0xff3300ff,
    0xffdd33ff,
    0xff33eeff,
    0xffffffff,
  ),
};

const MIXERS = {
  none: (it: DitherPair) => it,
  'mix-10': Mixers.mixBy(0.1),
  'mix-25': Mixers.mixBy(0.25),
  'mix-50': Mixers.mixBy(0.5),
  soft: Mixers.softMixer(),
};

const DITHERS: Record<string, [number, number]> = {
  '1x1': [1, 1],
  '2x2': [2, 2],
  '3x3': [3, 3],
  '5x3': [5, 3],
  '5x4': [5, 4],
  '5x5': [5, 5],
  '5x6': [5, 6],
  '2x50': [2, 50],
  '50x3': [50, 3],
  '10x6': [10, 6],
};

const SCALERS = {
  '1x': null,
  '5x6 (Nearest Neighbor)': Scalers.nearestNeighbor([5, 6]),
  Scale2x: Scalers.scale2x,
  Scale3x: Scalers.scale3x,
  Scale5x6: Scalers.scale5x6,
} as const;

const defaultDithers = ['1x1', '2x2', '3x3', '5x6'] as const;
const exoticDithers = Object.keys(DITHERS).filter(
  (it) => !(defaultDithers as readonly string[]).includes(it),
);

function RenderCanvas(props: RenderCanvasProps) {
  const { picData, renderPipeline, limit = Number.POSITIVE_INFINITY } = props;

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
      <canvas id="canvas" ref={init}>
        Canvas not supported…
      </canvas>
    </>
  );
}

interface ControlsProps {
  maxProgress: number;
  palette: keyof typeof PALETTES;
  progress: number;
  grayscale: boolean;
  mixer: keyof typeof MIXERS;
  dimmer: number;
  dither: keyof typeof DITHERS;
  scaler: keyof typeof SCALERS;

  setProgress: Dispatch<SetStateAction<number>>;
  setPalette: Dispatch<SetStateAction<keyof typeof PALETTES>>;
  setGrayscale: Dispatch<SetStateAction<boolean>>;
  setMixer: Dispatch<SetStateAction<keyof typeof MIXERS>>;
  setDimmer: Dispatch<SetStateAction<number>>;
  setDither: Dispatch<SetStateAction<keyof typeof DITHERS>>;
  setScaler: Dispatch<SetStateAction<keyof typeof SCALERS>>;
}

function Controls(props: ControlsProps) {
  const {
    progress,
    palette,
    grayscale,
    mixer,
    dimmer,
    dither,
    scaler,
    maxProgress,
    setProgress,
    setPalette,
    setGrayscale,
    setMixer,
    setDimmer,
    setDither,
    setScaler,
  } = props;

  const handleChangeProgress = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setProgress(parseInt(e.target.value, 10));
    },
    [setProgress],
  );

  const handleChangePalette = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setPalette(e.target.value as keyof typeof PALETTES);
    },
    [setPalette],
  );

  const handleChangeGrayscale = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setGrayscale(e.target.checked);
    },
    [setGrayscale],
  );

  const handleChangeMixer = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setMixer(e.target.value as keyof typeof MIXERS);
    },
    [setMixer],
  );

  const handleChangeDimmer = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setDimmer(parseInt(e.target.value, 10) / 100);
    },
    [setDimmer],
  );

  const handleChangeDither = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setDither(e.target.value as keyof typeof DITHERS);
    },
    [setDither],
  );

  const handleChangeScaler = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setScaler(e.target.value as keyof typeof SCALERS);
    },
    [setScaler],
  );

  return (
    <>
      <input
        type="range"
        value={progress}
        min={1}
        max={maxProgress}
        onChange={handleChangeProgress}
        style={{
          display: 'block',
          width: '100%',
        }}
      />
      <div>
        <label htmlFor="palette">Palette:</label>
        <select id="palette" value={palette} onChange={handleChangePalette}>
          <option value="CGA">CGA</option>
          <option value="TrueCGA">TrueCGA</option>
          <option value="DGA">AAP-DGA16</option>
          <option value="Colly">Collyflower's Soft CGA</option>
        </select>
      </div>
      <div>
        <label htmlFor="grayscale">Grayscale:</label>
        <input
          id="grayscale"
          type="checkbox"
          checked={grayscale}
          onChange={handleChangeGrayscale}
        />
      </div>
      <div>
        <label htmlFor="mixer">Mixer:</label>
        <select id="mixer" value={mixer} onChange={handleChangeMixer}>
          <option value="none">None</option>
          <option value="mix-10">Mix 10%</option>
          <option value="mix-25">Mix 25%</option>
          <option value="mix-50">Mix 50%</option>
          <option value="soft">Soft</option>
        </select>
      </div>
      <div>
        <label htmlFor="dimmer"> Dimmer:</label>
        <input
          id="dimmer"
          type="range"
          min="0"
          max="100"
          value={dimmer * 100}
          onChange={handleChangeDimmer}
        />
      </div>
      <div>
        <label htmlFor="dither">Dither Size:</label>
        <select id="dither" value={dither} onChange={handleChangeDither}>
          <optgroup label="Normal">
            {defaultDithers.map((key) => (
              <option value={key} key={key}>
                {key.replace('x', '×')}
              </option>
            ))}
          </optgroup>
          <optgroup label="Exotic">
            {exoticDithers.map((key) => (
              <option value={key} key={key}>
                {key.replace('x', '×')}
              </option>
            ))}
          </optgroup>
        </select>
      </div>
      <div>
        <label htmlFor="dither">Post-dither scaler:</label>
        <select id="dither" value={scaler} onChange={handleChangeScaler}>
          {Object.keys(SCALERS).map((key) => (
            <option value={key} key={key}>
              {key.replace('x', '×')}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

interface Sci0RenderProps {
  readonly data: string;
  readonly engine: 'sci0' | 'sci01';
  readonly compression: 0 | 1 | 2;
}

export function Sci0Renderer(props: Sci0RenderProps) {
  const { data, engine, compression } = props;
  const picData = useMemo(() => {
    const rawBytes = toByteArray(data);
    const bytes = decompress(engine, compression, rawBytes);
    return Pic.parseFrom(bytes);
  }, [data, engine, compression]);

  const [progress, setProgress] = useState(picData.length);
  const [palette, setPalette] = useState<keyof typeof PALETTES>('CGA');
  const [grayscale, setGrayscale] = useState(false);
  const [mixer, setMixer] = useState<keyof typeof MIXERS>('none');
  const [dimmer, setDimmer] = useState<number>(1);
  const [dither, setDither] = useState<keyof typeof DITHERS>('5x6');
  const [scaler, setScaler] = useState<keyof typeof SCALERS>(
    '5x6 (Nearest Neighbor)',
  );

  const pipeline = useMemo(() => {
    const basePalette = [
      dimmer < 1 && ((pal: Uint32Array) => IBM5153Dimmer(pal, dimmer)),
      grayscale && toGrayscale,
    ].reduce((pal, fn) => (fn ? fn(pal) : pal), PALETTES[palette]);
    const pairs = generateSciDitherPairs(basePalette, MIXERS[mixer]);
    return [
      SCALERS[scaler] ?? ((it: any) => it),
      createDitherizer(pairs, DITHERS[dither]),
    ];
  }, [palette, grayscale, mixer, dimmer, dither, scaler]);

  return (
    <>
      <RenderCanvas
        picData={picData}
        limit={progress}
        renderPipeline={pipeline}
      />
      <Controls
        maxProgress={picData.length}
        progress={progress}
        palette={palette}
        grayscale={grayscale}
        mixer={mixer}
        dimmer={dimmer}
        dither={dither}
        scaler={scaler}
        // events
        setProgress={setProgress}
        setPalette={setPalette}
        setGrayscale={setGrayscale}
        setMixer={setMixer}
        setDimmer={setDimmer}
        setDither={setDither}
        setScaler={setScaler}
      />
    </>
  );
}
