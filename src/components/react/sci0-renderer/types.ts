import { type CrtUpdateOptions } from '@4bitlabs/crt-lite';

export type RenderMode =
  | ['2d', Record<string, never>]
  | ['webgl2', CrtUpdateOptions];

export const DEFAULT_WEBGL2_OPTIONS = {
  Fx: -0.025,
  Fy: -0.035,
  S: 0.995,
  hBlur: 2.0,
  grain: 0.125,
  vignette: 1.0,
  scanLines: true,
};
