import { readdir, readFile } from 'node:fs/promises';
import { join as pathJoin } from 'node:path';
import {
  decompress,
  parseAllMappings,
  parseHeaderWithPayload,
  Resource,
  type ResourceHeader,
} from '@4bitlabs/sci0';
import { cyrb53bin } from '@utils/cybr53.ts';
import type { AstroIntegrationLogger } from 'astro';
import type { Loader } from 'astro/loaders';
import { z } from 'astro/zod';
import { fromByteArray } from 'base64-js';

interface CollectSourceOptions {
  path: string;
  resourceName?: string;
  filter?: (id: number) => boolean;
}

async function* collectSource(
  options: CollectSourceOptions,
  logger: AstroIntegrationLogger,
): AsyncGenerator<[ResourceHeader, Uint8Array]> {
  const { filter, path, resourceName = 'RESOURCE' } = options;
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
  ).filter((it) => filter?.(it.id) ?? true);

  const uniqueMatches = [...new Map(matches.map((it) => [it.id, it])).values()];

  const resourceFiles = new Map<number, Uint8Array>();
  for (const file of new Set(uniqueMatches.map((it) => it.file))) {
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

  for (const { file, offset } of uniqueMatches) {
    const resource = resourceFiles.get(file);
    if (!resource) {
      logger.error(`Resource not found: ${file}`);
      continue;
    }
    const [header, payload] = parseHeaderWithPayload(resource, offset);
    yield [header, payload];
  }
}

interface SciRawAssetLoader {
  sources: {
    [prefix: string]: {
      path: string;
      resourceName?: string;
      filter?: (id: number) => boolean;
    };
  };
}

export function sciRawAssetLoader(options: SciRawAssetLoader) {
  return {
    name: 'sci-raw-asset-loader',
    schema: z.object({
      compression: z.union([z.literal(0), z.literal(1), z.literal(2)]),
      content: z.base64(),
    }),
    load: async ({ store, logger }) => {
      store.clear();

      for (const [prefix, source] of Object.entries(options.sources)) {
        for await (const [header, bytes] of collectSource(source, logger)) {
          const resType = Resource.getTypeStr(header.id);
          const resId = Resource.getNumber(header.id);
          const id = `${prefix}/${resType.toLowerCase()}.${resId.toString(10).padStart(3, '0')}`;

          if (store.has(id)) {
            logger.warn(`Duplicate resource: ${id}`);
            continue;
          }

          store.set({
            id,
            data: {
              compression: header.compression,
              content: fromByteArray(bytes),
            },
            digest: cyrb53bin(bytes),
          });
        }
      }
    },
  } satisfies Loader;
}

interface SciAssetLoaderOptions {
  sources: {
    [prefix: string]: {
      path: string;
      resourceName?: string;
      filter?: (id: number) => boolean;
      engine?: 'sci0' | 'sci01';
    };
  };
}

export function sciAssetLoader(options: SciAssetLoaderOptions) {
  return {
    name: 'sci-asset-loader',
    schema: z.object({
      content: z.base64(),
    }),
    load: async (ctx) => {
      const { store, logger } = ctx;
      store.clear();

      for (const [prefix, source] of Object.entries(options.sources)) {
        const engine = source.engine ?? 'sci0';

        for await (const [header, bytes] of collectSource(source, logger)) {
          const resType = Resource.getTypeStr(header.id);
          const resId = Resource.getNumber(header.id);
          const id = `${prefix}/${resType.toLowerCase()}.${resId.toString(10).padStart(3, '0')}`;

          store.set({
            id,
            data: {
              pic: decompress(engine, header.compression, bytes),
            },
            digest: cyrb53bin(bytes),
          });
        }
      }
    },
  } satisfies Loader;
}
