import { asJsonSchema } from '../../lib/common';

export const fileSchema = asJsonSchema({
  type: 'object',
  additionalProperties: false,
  required: ['id', 'createdAt', 'name', 'size', 'mimetype', 'url'],
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
    },
    name: {
      type: 'string',
    },
    size: {
      type: 'integer',
    },
    mimetype: {
      type: 'string',
    },
    url: {
      type: 'string',
      format: 'uri',
    },
  },
});

export const fileUploadSchema = asJsonSchema({
  type: 'object',
  additionalProperties: false,
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

export const fileListPayloadSchema = asJsonSchema({
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
    mimetype: {
      type: 'string',
    },
    sizeFrom: {
      type: 'integer',
      minimum: 0,
    },
    sizeTo: {
      type: 'integer',
      minimum: 0,
    },
  },
});

export const fileDeleteSchema = asJsonSchema({
  type: 'object',
  additionalProperties: false,
  required: ['id'],
  properties: {
    id: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1,
        format: 'uuid',
      },
    },
  },
});
