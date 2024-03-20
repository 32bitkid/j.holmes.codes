import { type ImageDataLike } from '@4bitlabs/image';

export function createRender2d(
  canvasEl: HTMLCanvasElement,
): (imageData: ImageDataLike) => void {
  const ctx = canvasEl.getContext('bitmaprenderer', { alpha: false })!;

  let imgData: ImageData;
  return function render2d(
    { data, width, height }: ImageDataLike,
    _: Record<string, never> = {},
  ) {
    const uninitialized =
      !imgData || imgData.width !== width || imgData.height !== height;

    if (uninitialized) {
      canvasEl.width = width;
      canvasEl.height = height;
      imgData = new ImageData(width, height);
    }
    imgData.data.set(data);
    createImageBitmap(imgData).then((it) => ctx.transferFromImageBitmap(it));
  };
}
