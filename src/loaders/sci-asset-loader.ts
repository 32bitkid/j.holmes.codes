import { readdir, readFile } from 'node:fs/promises';
import { join as pathJoin } from 'node:path';
import {
  parseAllMappings,
  parseHeaderWithPayload,
  Resource,
  type ResourceHeader,
} from '@4bitlabs/sci0';
import { cyrb53bin } from '@utils/cybr53.ts';
import type { AstroIntegrationLogger } from 'astro';
import type { Loader } from 'astro/loaders';
import { z } from 'astro/zod';

async function loadPatch(
  path: string,
  number: number,
): Promise<{ id: number; data: Uint8Array }> {
  const fileData = await readFile(path);
  const resType = fileData[0] & 0b0111_1111;
  const id = (resType << 11) | (number & 0b111_1111_1111);
  return { id, data: fileData.subarray(2) };
}

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
  resources: {
    [prefix: string]: {
      path: string;
      resourceName?: string;
      filter?: (id: number) => boolean;
    };
  };
  patches?: { number: number; path: string; prefix: string }[];
}

export function sciRawAssetLoader(options: SciRawAssetLoader) {
  return {
    name: 'sci-raw-asset-loader',
    schema: z.object({
      id: z.number(),
      compression: z.union([z.literal(0), z.literal(1), z.literal(2)]),
      content: z.base64(),
    }),
    load: async ({ store, logger, parseData }) => {
      store.clear();

      const addData = async (
        prefix: string,
        resId: number,
        compression: number,
        bytes: Uint8Array,
      ) => {
        const resType = Resource.getTypeStr(resId);
        const resNum = Resource.getNumber(resId);
        const id = `${prefix}/${resType.toLowerCase()}.${resNum.toString(10).padStart(3, '0')}`;
        if (store.has(id)) {
          logger.warn(`Duplicate resource: ${id}`);
          return;
        }

        const data = await parseData({
          id,
          data: {
            id: resId,
            compression: compression,
            content: z.util.uint8ArrayToBase64(bytes),
          },
        });

        store.set({
          id,
          data,
          digest: cyrb53bin(bytes),
        });
      };

      for (const { path, prefix, number } of options.patches ?? []) {
        const { id: resId, data } = await loadPatch(path, number);
        await addData(prefix, resId, 0, data);
      }

      for (const [prefix, source] of Object.entries(options.resources)) {
        for await (const [header, data] of collectSource(source, logger)) {
          await addData(prefix, header.id, header.compression, data);
        }
      }
    },
  } satisfies Loader;
}
