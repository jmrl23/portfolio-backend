import fastifyMultipart, { Multipart } from '@fastify/multipart';
import fastifyPlugin from 'fastify-plugin';

export default fastifyPlugin(async function (app) {
  await app.register(fastifyMultipart, {
    attachFieldsToBody: true,
    limits: {
      fileSize: 20_000_000,
    },
    sharedSchemaId: '#multipartField',
  });

  // Fixes body fields
  // I don't like using type any but foc it!
  function fixBody(
    body: Record<string, Multipart | Multipart[] | any>,
  ): Record<string, string | string[]> {
    function stringifyField(field: Multipart): string {
      if (field.type === 'file') {
        return field.filename;
      }
      return field.value as any;
    }
    for (const key in body) {
      const field = body[key];
      if (Array.isArray(field)) {
        body[key] = field.map((field) => stringifyField(field));
        continue;
      }
      body[key] = stringifyField(field);
    }
    return body;
  }

  app.addHook('preValidation', async function (request) {
    const contentType = request.headers['content-type'];
    if (!contentType?.startsWith('multipart/form-data')) return;
    await request.saveRequestFiles();
    const body = (request.body ?? {}) as Record<string, any>;
    if (!body) return;
    request.body = fixBody(body);
  });
});
