import React, {
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
} from 'react';

import styles from './sci0-renderer.module.css';
import { type RenderMode } from './types.ts';

export interface RenderOptionsProps {
  mode: RenderMode;
  onChangeMode: Dispatch<SetStateAction<RenderMode>>;
}

export function RenderOptions(props: RenderOptionsProps) {
  const {
    onChangeMode,
    mode: [mode, options],
  } = props;

  if (mode === '2d') {
    return <em className={styles.noOptions}>n/a…</em>;
  }

  const handleChangeFx = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10) / -1000;
      onChangeMode(([prevMode, prevOptions]) => {
        if (prevMode !== 'webgl2') {
          return [prevMode, prevOptions];
        }
        return ['webgl2', { ...prevOptions, Fx: val }];
      });
    },
    [onChangeMode],
  );

  const handleChangeFy = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10) / -1000;
      onChangeMode(([prevMode, prevOptions]) => {
        if (prevMode !== 'webgl2') {
          return [prevMode, prevOptions];
        }
        return ['webgl2', { ...prevOptions, Fy: val }];
      });
    },
    [onChangeMode],
  );

  const handleChangeScale = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10) / 1000;
      onChangeMode(([prevMode, prevOptions]) => {
        if (prevMode !== 'webgl2') {
          return [prevMode, prevOptions];
        }
        return ['webgl2', { ...prevOptions, S: val }];
      });
    },
    [onChangeMode],
  );

  const handleChangeGrain = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10) / 1000;
      onChangeMode(([prevMode, prevOptions]) => {
        if (prevMode !== 'webgl2') {
          return [prevMode, prevOptions];
        }
        return ['webgl2', { ...prevOptions, grain: val }];
      });
    },
    [onChangeMode],
  );

  const handleChangeVignette = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10) / 1000;
      onChangeMode(([prevMode, prevOptions]) => {
        if (prevMode !== 'webgl2') {
          return [prevMode, prevOptions];
        }
        return ['webgl2', { ...prevOptions, vignette: val }];
      });
    },
    [onChangeMode],
  );

  const handleChangeHBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10);
      onChangeMode(([prevMode, prevOptions]) => {
        if (prevMode !== 'webgl2') {
          return [prevMode, prevOptions];
        }
        return ['webgl2', { ...prevOptions, hBlur: val }];
      });
    },
    [onChangeMode],
  );

  return (
    <>
      <label htmlFor="Fx">Fx:</label>
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
      <label htmlFor="Fy">Fy:</label>
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
      <label htmlFor="H Blur (GPU)">
        H-Blur<small>(hw)</small>:
      </label>
      <div>
        <input
          id="H Blur (GPU)"
          type="range"
          min="0"
          max="20"
          value={Math.floor(options.hBlur ?? 0)}
          onChange={handleChangeHBlur}
        />
      </div>
    </>
  );
}
