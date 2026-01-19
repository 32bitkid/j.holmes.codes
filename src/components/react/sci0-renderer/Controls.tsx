import {
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
} from 'react';

import {
  useCheckboxCallback,
  useEnumCallback,
  useNumericCallback,
} from './hooks.ts';
import { RenderOptions } from './render-options.tsx';

import {
  BLURS,
  type DITHERS,
  type MIXERS,
  type PALETTES,
  PIXEL_ASPECT_RATIOS,
  SCALERS,
  defaultDithers,
  exoticDithers,
} from './options.ts';
import styles from './sci0-renderer.module.css';
import { DEFAULT_WEBGL2_OPTIONS, type RenderMode } from './types.ts';

export interface ControlsProps {
  palette: keyof typeof PALETTES;
  grayscale: boolean;
  mixer: keyof typeof MIXERS;
  contrast: number;
  dither: keyof typeof DITHERS;
  scaler: keyof typeof SCALERS;
  pixelAspectRatio: keyof typeof PIXEL_ASPECT_RATIOS;
  postScaler: keyof typeof SCALERS;
  blur: keyof typeof BLURS;
  blurAmount: number;
  maximize: boolean;
  mode: RenderMode;

  onChangePalette: Dispatch<SetStateAction<keyof typeof PALETTES>>;
  onChangeGrayscale: Dispatch<SetStateAction<boolean>>;
  onChangeMixer: Dispatch<SetStateAction<keyof typeof MIXERS>>;
  onChangeContrast: Dispatch<SetStateAction<number>>;
  onChangeDither: Dispatch<SetStateAction<keyof typeof DITHERS>>;
  onChangeScaler: Dispatch<SetStateAction<keyof typeof SCALERS>>;
  onChangePixelAspectRatio: Dispatch<
    SetStateAction<keyof typeof PIXEL_ASPECT_RATIOS>
  >;
  onChangePostScaler: Dispatch<SetStateAction<keyof typeof SCALERS>>;
  onChangeBlur: Dispatch<SetStateAction<keyof typeof BLURS>>;
  onChangeBlurAmount: Dispatch<SetStateAction<number>>;
  onChangeMaximize: Dispatch<SetStateAction<boolean>>;
  onChangeMode: Dispatch<SetStateAction<RenderMode>>;
}

export function Controls(props: ControlsProps) {
  const {
    palette,
    grayscale,
    mixer,
    contrast,
    dither,
    scaler,
    pixelAspectRatio,
    postScaler,
    blur,
    blurAmount,
    maximize,
    mode,
    // setters
    onChangePalette,
    onChangeGrayscale,
    onChangeMixer,
    onChangeContrast,
    onChangeDither,
    onChangeScaler,
    onChangePixelAspectRatio,
    onChangePostScaler,
    onChangeBlur,
    onChangeBlurAmount,
    onChangeMaximize,
    onChangeMode,
  } = props;

  const handleModeSwitch = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const newMode = e.target.value as RenderMode[0];
      if (newMode === 'webgl2') {
        onChangeMode(['webgl2', DEFAULT_WEBGL2_OPTIONS]);
      } else {
        onChangeMode([newMode, {}]);
      }
    },
    [onChangeMode],
  );

  return (
    <div className={styles.container}>
      <fieldset className={styles.fieldset}>
        <legend>Pre-dither</legend>
        <label htmlFor="scaler">Pre-Scaler:</label>
        <select
          id="scaler"
          value={scaler}
          onChange={useEnumCallback(onChangeScaler)}
        >
          {Object.keys(SCALERS).map((key) => (
            <option value={key} key={key}>
              {key.replace('x', '×')}
            </option>
          ))}
        </select>
        <label htmlFor="pixel-aspect-ratio">Pixel Aspect Ratio:</label>
        <select
          id="pixel-aspect-ratio"
          value={pixelAspectRatio}
          onChange={useEnumCallback(onChangePixelAspectRatio)}
        >
          {Object.keys(PIXEL_ASPECT_RATIOS).map((key) => (
            <option value={key} key={key}>
              {key.replace(':', '∶')}
            </option>
          ))}
        </select>
        <label htmlFor="maximize">Maximize:</label>
        <input
          id="maximize"
          type="checkbox"
          checked={maximize}
          onChange={useCheckboxCallback(onChangeMaximize)}
        />
      </fieldset>
      <fieldset className={styles.fieldset}>
        <legend>Dithering</legend>
        <label htmlFor="dither">Dither Size:</label>
        <select
          id="dither"
          value={dither}
          onChange={useEnumCallback(onChangeDither)}
        >
          <optgroup label="Square">
            {defaultDithers.map((key) => (
              <option value={key} key={key}>
                {key.replace('x', '×')}
              </option>
            ))}
          </optgroup>
          <optgroup label="Non-square">
            {exoticDithers.map((key) => (
              <option value={key} key={key}>
                {key.replace('x', '×')}
              </option>
            ))}
          </optgroup>
        </select>

        <label htmlFor="palette">Palette:</label>
        <select
          id="palette"
          value={palette}
          onChange={useEnumCallback(onChangePalette)}
        >
          <option value="CGA">CGA</option>
          <option value="TrueCGA">TrueCGA</option>
          <option value="DGA">AAP-DGA16</option>
          <option value="Colly">Collyflower's Soft CGA</option>
        </select>
        <label htmlFor="grayscale">Grayscale:</label>
        <input
          id="grayscale"
          type="checkbox"
          checked={grayscale}
          onChange={useCheckboxCallback(onChangeGrayscale)}
        />
        <label htmlFor="mixer">Mixer:</label>
        <select
          id="mixer"
          value={mixer}
          onChange={useEnumCallback(onChangeMixer)}
        >
          <option value="none">None</option>
          <option value="mix-10">Mix 10%</option>
          <option value="mix-25">Mix 25%</option>
          <option value="mix-50">Mix 50%</option>
          <option value="soft">Soft</option>
        </select>
        <label htmlFor="contrast">Contrast:</label>
        <input
          id="contrast"
          type="range"
          min="0"
          max="100"
          value={contrast * 100}
          onChange={useNumericCallback(
            onChangeContrast,
            useCallback((n: number) => n / 100, []),
          )}
        />
      </fieldset>
      <fieldset className={styles.fieldset}>
        <legend>Post-Processing</legend>
        <label htmlFor="postScaler">Post-Scaler:</label>
        <select
          id="postScaler"
          value={postScaler}
          onChange={useEnumCallback(onChangePostScaler)}
        >
          {Object.keys(SCALERS).map((key) => (
            <option value={key} key={key}>
              {key.replace('x', '×')}
            </option>
          ))}
        </select>
        <label htmlFor="blur-type">
          Blur<small>(sw)</small>:
        </label>
        <select
          id="blur-type"
          value={blur}
          onChange={useEnumCallback(onChangeBlur)}
        >
          {Object.keys(BLURS).map((key) => (
            <option value={key} key={key}>
              {key}
            </option>
          ))}
        </select>
        <label htmlFor="blurAmount">Blur Amount:</label>
        <input
          disabled={blur === '(none)'}
          id="blurAmount"
          type="range"
          min="1"
          max="10"
          value={blurAmount}
          onChange={useNumericCallback(onChangeBlurAmount)}
        />
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>
          <label htmlFor="mode">Canvas</label>{' '}
          <select id="mode" value={mode[0]} onChange={handleModeSwitch}>
            <option value="2d">Software</option>
            <option value="webgl2">WebGL2</option>
          </select>
        </legend>
        <RenderOptions mode={mode} onChangeMode={onChangeMode} />
      </fieldset>
    </div>
  );
}
