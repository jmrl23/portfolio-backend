import { MultipartFile } from '@fastify/multipart';
import { FastifyRequest } from 'fastify';

interface FileSaveLimitsOptions {
  files: number;
}

export function filesFieldsMultiple(
  fields: string[],
  limits?: FileSaveLimitsOptions,
) {
  return async function (request: FastifyRequest) {
    if (request.saveRequestFiles !== null) {
      await request.saveRequestFiles({
        limits,
      });
    }

    if (!request?.body) return;
    const body = request.body as Record<
      string,
      MultipartFile[] | MultipartFile | undefined
    >;
    for (const field of fields) {
      let files = body[field];
      if (!files) files = [];
      if (!Array.isArray(files)) files = [files];
      const fileNames = files
        .filter((file) => file.file !== undefined)
        .map((file) => file.filename);
      (body as Record<string, any>)[field] = fileNames;
    }
  };
}

export function filesFieldsSingle(
  fields: string[],
  limits?: Omit<FileSaveLimitsOptions, 'files'>,
) {
  return async function (request: FastifyRequest) {
    await request.saveRequestFiles({
      limits,
    });

    if (!request?.body) return;
    const body = request.body as Record<string, MultipartFile | undefined>;
    for (const field of fields) {
      let file = body[field];
      if (Array.isArray(file)) file = file[0];
      body[field] = file;
    }
  };
}
