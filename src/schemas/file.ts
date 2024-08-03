import { FromSchema } from 'json-schema-to-ts';
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

export const fileDeleteSchema = asJsonSchema({
  type: 'object',
  additionalProperties: false,
  required: ['ids'],
  properties: {
    ids: {
      type: 'array',
      items: {
        type: 'string',
        minLength: 1,
      },
    },
  },
});
export type FileDelete = FromSchema<typeof fileDeleteSchema>;

export const fileListPayloadSchema = asJsonSchema({
  type: 'object',
  additionalProperties: false,
  properties: {
    revalidate: {
      type: 'boolean',
    },
    fileName: {
      type: 'string',
      minLength: 1,
    },
    sizeMin: {
      type: 'integer',
      minimum: 1,
    },
    sizeMax: {
      type: 'integer',
      minimum: 1,
    },
  },
});
export type FileListPayload = FromSchema<typeof fileListPayloadSchema>;

export const fileSchema = asJsonSchema({
  type: 'object',
  additionalProperties: false,
  required: ['id', 'fileName', 'url', 'size'],
  properties: {
    id: {
      type: 'string',
    },
    fileName: {
      type: 'string',
    },
    url: {
      type: 'string',
      format: 'uri',
    },
    size: {
      type: 'integer',
    },
  },
});
