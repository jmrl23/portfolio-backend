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
      nullable: true,
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

export const projectListPayloadSchema = asJsonSchema({
  type: 'object',
  additionalProperties: false,
  properties: {
    revalidate: {
      type: 'boolean',
    },
    id: {
      type: 'string',
      format: 'uuid',
    },
    createdAtFrom: {
      type: 'string',
      format: 'date-time',
    },
    createdAtTo: {
      type: 'string',
      format: 'date-time',
    },
    updatedAtFrom: {
      type: 'string',
      format: 'date-time',
    },
    updatedAtTo: {
      type: 'string',
      format: 'date-time',
    },
    skip: {
      type: 'integer',
      minimum: 0,
    },
    take: {
      type: 'integer',
      minimum: 0,
    },
    order: {
      type: 'string',
      enum: ['asc', 'desc'],
    },
    name: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    repositoryUrl: {
      type: 'string',
    },
    previewUrl: {
      type: 'string',
    },
    topics: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
});

export const projectUpdateSchema = asJsonSchema({
  type: 'object',
  additionalProperties: false,
  required: ['id'],
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
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
  },
});

export const projectUpdateImagesSchema = asJsonSchema({
  type: 'object',
  additionalProperties: false,
  required: ['id'],
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
    },
    add: {
      type: 'array',
      items: {
        type: 'string',
        format: 'uuid',
      },
    },
    remove: {
      type: 'array',
      items: {
        type: 'string',
        format: 'uuid',
      },
    },
  },
});

export const projectDeleteSchema = asJsonSchema({
  type: 'object',
  additionalProperties: false,
  required: ['id'],
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
    },
  },
});
