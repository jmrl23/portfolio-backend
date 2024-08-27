import { asJsonSchema } from '../../lib/common';
import { fileSchema } from '../files/filesSchema';

export const projectSchema = asJsonSchema({
  type: 'object',
  additionalProperties: false,
  required: [
    'id',
    'createdAt',
    'updatedAt',
    'name',
    'description',
    'repositoryUrl',
    'topics',
    'images',
  ],
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
    },
    name: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    repositoryUrl: {
      type: 'string',
      format: 'uri',
    },
    previewUrl: {
      type: 'string',
      format: 'uri',
    },
    topics: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    images: {
      type: 'array',
      items: fileSchema,
    },
  },
});

export const projectCreateSchema = asJsonSchema({
  type: 'object',
  additionalProperties: false,
  required: ['name', 'description', 'repositoryUrl'],
  properties: {
    name: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    repositoryUrl: {
      type: 'string',
      format: 'uri',
    },
    previewUrl: {
      type: 'string',
      format: 'uri',
    },
    topics: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    images: {
      type: 'array',
      items: {
        type: 'string',
        format: 'uuid',
      },
    },
  },
});
