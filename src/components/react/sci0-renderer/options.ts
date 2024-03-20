import { Scalers, BlurFilters, type ImageDataLike } from '@4bitlabs/image';
import {
  DGA_PALETTE,
  Mixers,
  RAW_CGA,
  TRUE_CGA,
  type DitherPair,
} from '@4bitlabs/color';

export const PALETTES = {
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

export const MIXERS = {
  none: (it: DitherPair) => it,
  'mix-10': Mixers.mixBy(0.1),
  'mix-25': Mixers.mixBy(0.25),
  'mix-50': Mixers.mixBy(0.5),
  soft: Mixers.softMixer(),
};

export const DITHERS: Record<string, [number, number]> = {
  '1x1': [1, 1],
  '2x2': [2, 2],
  '3x3': [3, 3],
  '4x4': [4, 4],
  '5x3': [5, 3],
  '5x4': [5, 4],
  '5x5': [5, 5],
  '5x6': [5, 6],
  '2x50': [2, 50],
  '50x3': [50, 3],
  '10x6': [10, 6],
};

export const SCALERS = {
  '(none)': (it: ImageDataLike) => it,
  '2x2': Scalers.nearestNeighbor([2, 2]),
  '3x3': Scalers.nearestNeighbor([3, 3]),
  '5x5': Scalers.nearestNeighbor([5, 5]),
  '5x6': Scalers.nearestNeighbor([5, 6]),
  'Scale2x / EPX': Scalers.scale2x,
  Scale3x: Scalers.scale3x,
  Scale5x6: Scalers.scale5x6,
} as const;

export const PIXEL_ASPECT_RATIOS = {
  '1:1': '32 / 19',
  '1:1.2': '80 / 57',
};

export const defaultDithers = ['1x1', '2x2', '3x3', '4x4', '5x5'] as const;
export const exoticDithers = Object.keys(DITHERS).filter(
  (it) => !(defaultDithers as readonly string[]).includes(it),
);

export const BLURS = {
  '(none)': (_: number) => (it: ImageDataLike) => it,
  'box (sw)':
    (radius: number) =>
    (it: ImageDataLike): ImageDataLike =>
      BlurFilters.boxBlur(radius)(it),
  'hbox (sw)':
    (radius: number) =>
    (it: ImageDataLike): ImageDataLike =>
      BlurFilters.hBoxBlur(radius)(it),
  'gaussian (sw)':
    (sigma: number) =>
    (it: ImageDataLike): ImageDataLike =>
      BlurFilters.gaussBlur(sigma)(it),
  'hBlur (sw)':
    (sigma: number) =>
    (it: ImageDataLike): ImageDataLike =>
      BlurFilters.hBlur(sigma)(it),
};
