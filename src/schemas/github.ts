import { asJsonSchema } from '../lib/common';

export const projectSchema = asJsonSchema({
  type: 'object',
  additionalProperties: false,
  required: ['id', 'name', 'description', 'url', 'languages'],
  properties: {
    id: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    url: {
      type: 'string',
      format: 'uri',
    },
    languages: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
});
