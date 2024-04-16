import { type ImageDataLike, type IndexedPixelData } from '@4bitlabs/image';
import * as BlurFilters from '@4bitlabs/blur-filters';
import * as ResizeFilters from '@4bitlabs/resize-filters';
import { Palettes, Mixers, type DitherPair } from '@4bitlabs/color';

export const PALETTES = {
  CGA: Palettes.CGA_PALETTE,
  TrueCGA: Palettes.TRUE_CGA_PALETTE,
  DGA: Palettes.DGA_PALETTE,
  Colly: Palettes.COLLY_SOFT_PALETTE,
};

export const MIXERS = {
  none: (it: Readonly<DitherPair>): DitherPair => [...it],
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
  '(none)': <T extends ImageDataLike | IndexedPixelData>(it: T): T => it,
  '2x2': ResizeFilters.nearestNeighbor([2, 2]),
  '3x3': ResizeFilters.nearestNeighbor([3, 3]),
  '5x5': ResizeFilters.nearestNeighbor([5, 5]),
  '5x6': ResizeFilters.nearestNeighbor([5, 6]),
  'Scale2x / EPX': ResizeFilters.scale2x,
  Scale3x: ResizeFilters.scale3x,
  Scale5x6: ResizeFilters.scale5x6,
};

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
} as const;
