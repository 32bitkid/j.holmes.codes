import type { Vec2 } from '@4bitlabs/vec2';

export const nGon = (length: number): Vec2[] =>
  Array.from(
    { length: length },
    (_, i): Vec2 => [
      Math.cos((i / length) * (Math.PI * 2)),
      -Math.sin((i / length) * (Math.PI * 2)),
    ],
  );

export const poly = (
  ctx: CanvasRenderingContext2D,
  [first, ...rest]: Vec2[],
): void => {
  ctx.moveTo(...first);
  rest.forEach((it) => ctx.lineTo(...it));
  ctx.closePath();
};

export function* odds<T>(items: T[]): IterableIterator<[T, T, T]> {
  const length = items.length;
  for (let i = 1; i < length; i += 2)
    yield [items[i - 1], items[i], items[(i + 1) % length]];
}

export function text(
  ctx: CanvasRenderingContext2D,
  pos: Vec2,
  str: string,
  offset: Vec2 = [0, 0],
  style = 'black',
) {
  ctx.save();
  ctx.translate(...offset);
  ctx.fillStyle = style;
  ctx.fillText(str, ...pos);
  ctx.restore();
}
