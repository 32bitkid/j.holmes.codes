import React, {
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
} from 'react';
import { type CrtUpdateOptions } from '@4bitlabs/crt-lite';

import styles from './sci0-renderer.module.css';
import { type RenderMode } from './types.ts';

export interface RenderOptionsProps {
  mode: RenderMode;
  onChangeMode: Dispatch<SetStateAction<RenderMode>>;
}

const setRenderModeState =
  (changes: Partial<CrtUpdateOptions>) =>
  ([prevMode, prevOptions]: RenderMode): RenderMode => {
    if (prevMode !== 'webgl2') {
      return [prevMode, prevOptions];
    }
    return ['webgl2', { ...prevOptions, ...changes }];
  };

const useChangeFor = <TKey extends keyof CrtUpdateOptions>(
  key: TKey,
  fn: (el: HTMLInputElement) => CrtUpdateOptions[TKey],
  updateFn: Dispatch<SetStateAction<RenderMode>>,
) =>
  useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = fn(e.target);
      updateFn(setRenderModeState({ [key]: val }));
    },
    [key, fn],
  );

const valueToMilli = ({ value }: HTMLInputElement) =>
  parseInt(value, 10) / 1000;

const valueToNegMilli = (el: HTMLInputElement) => -valueToMilli(el);

const valueToInt = ({ value }: HTMLInputElement) => parseInt(value, 10);
const checkedToBool = ({ checked }: HTMLInputElement) => checked;

export function RenderOptions(props: RenderOptionsProps) {
  const {
    onChangeMode,
    mode: [mode, options],
  } = props;

  if (mode === '2d') {
    return <em className={styles.noOptions}>n/a…</em>;
  }

  const handleChangeHBlur = useChangeFor('hBlur', valueToInt, onChangeMode);
  const handleChangeFx = useChangeFor('Fx', valueToNegMilli, onChangeMode);
  const handleChangeFy = useChangeFor('Fy', valueToNegMilli, onChangeMode);
  const handleChangeScale = useChangeFor('S', valueToMilli, onChangeMode);
  const handleChangeGrain = useChangeFor('grain', valueToMilli, onChangeMode);
  const handleChangeVignette = useChangeFor(
    'vignette',
    valueToMilli,
    onChangeMode,
  );
  const handleChangeScanLines = useChangeFor(
    'scanLines',
    checkedToBool,
    onChangeMode,
  );

  return (
    <>
      <label htmlFor="Scanlines">Scanlines:</label>
      <div>
        <input
          id="Scanlines"
          type="checkbox"
          min="0"
          max="10"
          checked={options.scanLines}
          onChange={handleChangeScanLines}
        />
      </div>
      <label htmlFor="H Blur (GPU)">
        H-Blur<small>(hw)</small>:
      </label>
      <div>
        <input
          id="H Blur (GPU)"
          type="range"
          min="0"
          max="10"
          value={Math.floor(options.hBlur ?? 0)}
          onChange={handleChangeHBlur}
        />
      </div>
      <hr />
      <label htmlFor="Fx">
        Curve <small>(Fx)</small>:
      </label>
      <div>
        <input
          id="Fx"
          type="range"
          min="0"
          max="200"
          value={Math.floor(-(options.Fx ?? 0) * 1000)}
          onChange={handleChangeFx}
        />
      </div>
      <label htmlFor="Fy">
        Curve <small>(Fy)</small>:
      </label>
      <div>
        <input
          id="Fy"
          type="range"
          min="0"
          max="200"
          value={Math.floor(-(options.Fy ?? 0) * 1000)}
          onChange={handleChangeFy}
        />
      </div>
      <label htmlFor="Scale">Scale:</label>
      <div>
        <input
          id="Scale"
          type="range"
          min="800"
          max="1000"
          value={Math.floor((options.S ?? 0) * 1000)}
          onChange={handleChangeScale}
        />
      </div>
      <hr />
      <label htmlFor="Grain">Grain:</label>
      <div>
        <input
          id="Grain"
          type="range"
          min="0"
          max="300"
          value={Math.floor((options.grain ?? 0) * 1000)}
          onChange={handleChangeGrain}
        />
      </div>
      <label htmlFor="Vignette">Vignette:</label>
      <div>
        <input
          id="Vignette"
          type="range"
          min="0"
          max="200"
          value={Math.floor((options.vignette ?? 0) * 1000)}
          onChange={handleChangeVignette}
        />
      </div>
    </>
  );
}
