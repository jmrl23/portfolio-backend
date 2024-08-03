import { asRoute } from '../lib/common';
import { store } from '../lib/imagekit';
import FileStoreService from '../services/FileStoreService';
import multer from 'fastify-multer';
import os from 'node:os';
import { File } from 'fastify-multer/lib/interfaces';
import { fileUploadSchema } from '../schemas/file';
import fs from 'node:fs';

export const prefix = '/file';

declare module 'fastify' {
  interface FastifyRequest {
    files: File[];
  }
}

export default asRoute(async function fileRoute(app) {
  const fileStoreService = new FileStoreService(store);
  const upload = multer({ dest: os.tmpdir() });

  await app.register(multer.contentParser);

  app.route({
    method: 'POST',
    url: '/upload',
    preValidation: [
      async function (request) {
        request.body = {
          files: [],
        };
      },
    ],
    preHandler: [upload.array('files', 5)],
    schema: {
      body: fileUploadSchema,
    },
    async handler(request) {
      const files = await Promise.all(
        request.files.map(async (file) => {
          const data = fs.readFileSync(file.path!);
          return await fileStoreService.upload(data, file.originalname);
        }),
      );
      return {
        files,
      };
    },
  });
});
