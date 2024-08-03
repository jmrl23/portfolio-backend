import { asJsonSchema } from '../lib/common';

export const fileUploadSchema = asJsonSchema({
  type: 'object',
  additionalProperties: false,
  required: ['files'],
  properties: {
    files: {
      type: 'array',
      maxItems: 5,
      items: {
        type: 'string',
        format: 'binary',
      },
    },
  },
});
