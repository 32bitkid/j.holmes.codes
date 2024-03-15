import React, {
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
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
}

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
  } = props;

  const handleChangeProgress = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChangeProgress(parseInt(e.target.value, 10));
    },
    [onChangeProgress],
  );

  const handleChangePalette = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      onChangePalette(e.target.value as keyof typeof PALETTES);
    },
    [onChangePalette],
  );

  const handleChangeGrayscale = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChangeGrayscale(e.target.checked);
    },
    [onChangeGrayscale],
  );

  const handleChangeMixer = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      onChangeMixer(e.target.value as keyof typeof MIXERS);
    },
    [onChangeMixer],
  );

  const handleChangeDimmer = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChangeDimmer(parseInt(e.target.value, 10) / 100);
    },
    [onChangeDimmer],
  );

  const handleChangeDither = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      onChangeDither(e.target.value as keyof typeof DITHERS);
    },
    [onChangeDither],
  );

  const handleChangeScaler = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      onChangeScaler(e.target.value as keyof typeof SCALERS);
    },
    [onChangeScaler],
  );

  const handleChangePixelAspectRatio = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      onChangePixelAspectRatio(
        e.target.value as keyof typeof PIXEL_ASPECT_RATIOS,
      );
    },
    [onChangeScaler],
  );

  const handleChangePostScaler = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      onChangePostScaler(e.target.value as keyof typeof SCALERS);
    },
    [onChangePostScaler],
  );

  const handleChangeBlur = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      onChangeBlur(e.target.value as keyof typeof BLURS);
    },
    [onChangeBlur],
  );

  const handleChangeBlurAmount = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChangeBlurAmount(parseInt(e.target.value, 10));
    },
    [onChangeBlurAmount],
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
      <fieldset className={styles.fieldset}>
        <legend>Pre-dither</legend>
        <label htmlFor="scaler">Pre-Scaler:</label>
        <select id="scaler" value={scaler} onChange={handleChangeScaler}>
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
        <select id="dither" value={dither} onChange={handleChangeDither}>
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
        <select id="palette" value={palette} onChange={handleChangePalette}>
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
          onChange={handleChangeGrayscale}
        />
        <label htmlFor="mixer">Mixer:</label>
        <select id="mixer" value={mixer} onChange={handleChangeMixer}>
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
          onChange={handleChangeDimmer}
        />
      </fieldset>
      <fieldset className={styles.fieldset}>
        <legend>Post-Processing</legend>
        <label htmlFor="postScaler">Post-Scaler:</label>
        <select
          id="postScaler"
          value={postScaler}
          onChange={handleChangePostScaler}
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
        <select id="blur-type" value={blur} onChange={handleChangeBlur}>
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
          onChange={handleChangeBlurAmount}
        />
        <label htmlFor="pixel-aspect-ratio">Pixel Aspect Ratio:</label>
        <select
          id="pixel-aspect-ratio"
          value={pixelAspectRatio}
          onChange={handleChangePixelAspectRatio}
        >
          {Object.keys(PIXEL_ASPECT_RATIOS).map((key) => (
            <option value={key} key={key}>
              {key.replace(':', '∶')}
            </option>
          ))}
        </select>
      </fieldset>
    </>
  );
}
