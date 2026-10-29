import { getCollection, getEntry } from 'astro:content';
import { IBM5153Contrast, Palettes } from '@4bitlabs/color';
import { generatePairs } from '@4bitlabs/color/dithers';
import { createDitherFilter, renderPixelData } from '@4bitlabs/image';
import { decompress, parsePic, Resource, ResourceTypes } from '@4bitlabs/sci0';
import { renderPic } from '@4bitlabs/sci0-renderer';
import { MIXERS } from '@components/react/sci0-renderer/options.ts';
import type { APIRoute } from 'astro';
import { toByteArray } from 'base64-js';
import { encode } from 'fast-png';

const CACHE = new Map<string, Buffer<ArrayBuffer>>();

export async function getStaticPaths() {
  const sci0Pics = await getCollection('sci0pics');
  const sci0Data = Object.fromEntries(
    (
      await getCollection(
        'sci0data',
        (it) => Resource.getType(it.data.id) === ResourceTypes.PIC_TYPE,
      )
    ).map((it) => [it.id, it]),
  );
  return sci0Pics.flatMap((it) => {
    const data = sci0Data[it.data.source.id];
    if (!data) return [];
    const picNum = Resource.getNumber(data.data.id);
    return {
      params: {
        game: it.data.game.id,
        pic: picNum.toString(10),
      },
      props: { id: it.id },
    };
  });
}

export const GET: APIRoute = async (ctx) => {
  {
    const hit = CACHE.get(ctx.props.id);
    if (hit) return new Response(hit);
  }

  const picEntry = await getEntry('sci0pics', ctx.props.id);
  if (!picEntry) return new Response(null, { status: 404 });

  const gameEntry = await getEntry(picEntry.data.game);
  if (!gameEntry) return new Response(null, { status: 404 });

  const sourceEntry = await getEntry(picEntry.data.source);
  if (!sourceEntry) return new Response(null, { status: 404 });

  const pic = parsePic(
    decompress(
      gameEntry.data.engine,
      sourceEntry.data.compression,
      toByteArray(sourceEntry.data.content),
    ),
  );

  const rendered = renderPic(pic);
  const ditherMix = picEntry.data.dither ?? 'soft';
  const mix = MIXERS[ditherMix];

  const image = renderPixelData(rendered.visible, {
    render: createDitherFilter(
      generatePairs(IBM5153Contrast(Palettes.TRUE_CGA_PALETTE, 0.72), mix),
      [1, 1],
    ),
  });

  const png = Buffer.from(encode(image));
  CACHE.set(ctx.props.id, png);

  return new Response(png);
};
