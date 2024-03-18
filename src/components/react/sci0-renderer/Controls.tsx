import React, {
  type Dispatch,
  type SetStateAction,
  type ChangeEventHandler,
  useCallback,
} from 'react';

import {
  PIXEL_ASPECT_RATIOS,
  PALETTES,
  DITHERS,
  MIXERS,
  SCALERS,
  exoticDithers,
  defaultDithers,
  BLURS,
} from './options.ts';
import styles from './sci0-renderer.module.css';

export interface ControlsProps {
  maxProgress: number;
  palette: keyof typeof PALETTES;
  progress: number;
  grayscale: boolean;
  mixer: keyof typeof MIXERS;
  dimmer: number;
  dither: keyof typeof DITHERS;
  scaler: keyof typeof SCALERS;
  pixelAspectRatio: keyof typeof PIXEL_ASPECT_RATIOS;
  postScaler: keyof typeof SCALERS;
  blur: keyof typeof BLURS;
  blurAmount: number;
  maximize: boolean;
  mode: '2d' | 'webgl2';

  onChangeProgress: Dispatch<SetStateAction<number>>;
  onChangePalette: Dispatch<SetStateAction<keyof typeof PALETTES>>;
  onChangeGrayscale: Dispatch<SetStateAction<boolean>>;
  onChangeMixer: Dispatch<SetStateAction<keyof typeof MIXERS>>;
  onChangeDimmer: Dispatch<SetStateAction<number>>;
  onChangeDither: Dispatch<SetStateAction<keyof typeof DITHERS>>;
  onChangeScaler: Dispatch<SetStateAction<keyof typeof SCALERS>>;
  onChangePixelAspectRatio: Dispatch<
    SetStateAction<keyof typeof PIXEL_ASPECT_RATIOS>
  >;
  onChangePostScaler: Dispatch<SetStateAction<keyof typeof SCALERS>>;
  onChangeBlur: Dispatch<SetStateAction<keyof typeof BLURS>>;
  onChangeBlurAmount: Dispatch<SetStateAction<number>>;
  onChangeMaximize: Dispatch<SetStateAction<boolean>>;
  onChangeMode: Dispatch<SetStateAction<'2d' | 'webgl2'>>;
}

const useCheckboxCallback = (
  setter: Dispatch<SetStateAction<boolean>>,
): ChangeEventHandler<HTMLInputElement> =>
  useCallback((e) => setter(e.target.checked), [setter]);

const useNumericCallback = (
  setter: Dispatch<SetStateAction<number>>,
  mapFn: (n: number) => number = (n) => n,
): ChangeEventHandler<HTMLInputElement> =>
  useCallback((e) => setter(mapFn(parseInt(e.target.value, 10))), [setter]);

const useEnumCallback = <T extends string>(
  setter: Dispatch<SetStateAction<T>>,
): ChangeEventHandler<HTMLSelectElement> =>
  useCallback((e) => setter(e.target.value as T), [setter]);

export function Controls(props: ControlsProps) {
  const {
    maxProgress,
    progress,
    palette,
    grayscale,
    mixer,
    dimmer,
    dither,
    scaler,
    pixelAspectRatio,
    postScaler,
    blur,
    blurAmount,
    maximize,
    mode,
    // setters
    onChangeProgress,
    onChangePalette,
    onChangeGrayscale,
    onChangeMixer,
    onChangeDimmer,
    onChangeDither,
    onChangeScaler,
    onChangePixelAspectRatio,
    onChangePostScaler,
    onChangeBlur,
    onChangeBlurAmount,
    onChangeMaximize,
    onChangeMode,
  } = props;

  return (
    <>
      <input
        type="range"
        value={progress}
        min={1}
        max={maxProgress}
        onChange={useNumericCallback(onChangeProgress)}
        style={{
          display: 'block',
          width: '100%',
        }}
      />
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
        <label htmlFor="dimmer"> Dimmer:</label>
        <input
          id="dimmer"
          type="range"
          min="0"
          max="100"
          value={dimmer * 100}
          onChange={useNumericCallback(onChangeDimmer, (n) => n / 100)}
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
          Blur <small>(CPU)</small>:
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

        <label htmlFor="mode">Mode:</label>
        <select id="mode" value={mode} onChange={useEnumCallback(onChangeMode)}>
          <option value="2d">Software</option>
          <option value="webgl2">WebGL2</option>
        </select>
      </fieldset>
    </>
  );
}
