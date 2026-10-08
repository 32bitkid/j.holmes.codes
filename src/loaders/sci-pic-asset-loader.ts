import { readdir, readFile } from 'node:fs/promises';
import { join as pathJoin } from 'node:path';
import {
  decompress,
  parseAllMappings,
  parseHeaderWithPayload,
  parsePic,
  Resource,
  type ResourceHeader,
  ResourceTypes,
} from '@4bitlabs/sci0';
import { cyrb53bin } from '@utils/cybr53.ts';
import type { AstroIntegrationLogger } from 'astro';
import type { Loader } from 'astro/loaders';
import { z } from 'astro/zod';
import { fromByteArray } from 'base64-js';

interface SciPicAssetLoaderOptions {
  sources: {
    [prefix: string]: string | { path: string; resourceName?: string };
  };
}

async function* collectSource(
  options: string | { path: string; resourceName?: string },
  logger: AstroIntegrationLogger,
): AsyncGenerator<[ResourceHeader, Uint8Array]> {
  const path = typeof options === 'string' ? options : options.path;
  const resourceName =
    (typeof options === 'string' ? {} : options).resourceName ?? 'RESOURCE';
  const RESOURCE = RegExp.escape(resourceName);

  logger.info(`Scanning ${path} for ${resourceName}.map`);

  const files = await readdir(path);
  const mapPath = files.find((it) =>
    it.match(new RegExp(`^${RESOURCE}\\.MAP$`, 'i')),
  );
  if (!mapPath) {
    logger.error(`Resource root not found: ${path}`);
    return;
  }

  const matches = parseAllMappings(
    await readFile(pathJoin(path, mapPath)),
  ).filter((it) => Resource.getType(it.id) === ResourceTypes.PIC_TYPE);

  const resourceFiles = new Map<number, Uint8Array>();
  for (const file of new Set(matches.map((it) => it.file))) {
    const packFile = files.find((it) =>
      it.match(
        new RegExp(
          `^${RESOURCE}\\.${file.toString(10).padStart(3, '0')}$`,
          'i',
        ),
      ),
    );

    if (!packFile) {
      logger.error(`Resource not found: ${file}`);
      return;
    }
    const packBytes = await readFile(pathJoin(path, packFile));
    resourceFiles.set(file, packBytes);
  }

  for (const { file, offset } of matches) {
    const resource = resourceFiles.get(file);
    if (!resource) {
      logger.error(`Resource not found: ${file}`);
      continue;
    }
    const [header, payload] = parseHeaderWithPayload(resource, offset);

    yield [header, payload];
  }
}

export function sciPicAssetLoader(options: SciPicAssetLoaderOptions) {
  return {
    name: 'sci-pic-asset-loader',
    schema: z.object({
      compression: z.union([z.literal(0), z.literal(1), z.literal(2)]),
      content: z.string(),
    }),
    load: async ({ store, logger, parseData }) => {
      store.clear();

      for (const [prefix, source] of Object.entries(options.sources)) {
        for await (const [header, bytes] of collectSource(source, logger)) {
          const resType = Resource.getTypeStr(header.id);
          const resId = Resource.getNumber(header.id);
          const data = await parseData({
            id: `${prefix}/${resType.toLowerCase()}.${resId.toString(10).padStart(3, '0')}`,
            data: {
              compression: header.compression,
              content: fromByteArray(bytes),
            },
          });
          store.set({
            id: `${prefix}/${resType.toLowerCase()}.${resId.toString(10).padStart(3, '0')}`,
            data,
            digest: cyrb53bin(bytes),
          });
        }
      }
    },
  } satisfies Loader;
}

interface SciPicDataLoaderOptions {
  sources: {
    [prefix: string]:
      | string
      | { path: string; resourceName?: string; engine?: 'sci0' | 'sci01' };
  };
}

export function sciPicDataLoader(options: SciPicDataLoaderOptions) {
  return {
    name: 'sci-pic-asset-loader',
    schema: z.object({
      pic: z.any(),
    }),
    load: async (ctx) => {
      const { store, logger } = ctx;
      store.clear();

      for (const [prefix, source] of Object.entries(options.sources)) {
        const engine =
          (typeof source === 'string' ? {} : source).engine ?? 'sci0';

        for await (const [header, bytes] of collectSource(source, logger)) {
          const resType = Resource.getTypeStr(header.id);
          const resId = Resource.getNumber(header.id);
          const id = `${prefix}/${resType.toLowerCase()}.${resId.toString(10).padStart(3, '0')}`;

          store.set({
            id,
            data: {
              pic: parsePic(decompress(engine, header.compression, bytes)),
            },
            digest: cyrb53bin(bytes),
          });
        }
      }
    },
  } satisfies Loader;
}
