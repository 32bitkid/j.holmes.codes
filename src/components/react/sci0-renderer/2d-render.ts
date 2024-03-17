import { type ImageDataLike } from '@4bitlabs/image';

function createRender2D(
  canvasEl: HTMLCanvasElement,
): (imageData: ImageDataLike) => void {
  const ctx = canvasEl.getContext('bitmaprenderer')!;

  let imgData: ImageData;
  return function render2d({ data, width, height }: ImageDataLike) {
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