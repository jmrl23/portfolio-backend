import { asJsonSchema } from '../../lib/common';
import { permissions } from './authService';

export const authApiKeySchema = asJsonSchema({
  type: 'object',
  additionalProperties: false,
  required: ['id', 'createdAt', 'key', 'permissions', 'revoked'],
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
    },
    key: {
      type: 'string',
      minLength: 32,
      maxLength: 32,
    },
    description: {
      type: 'string',
      nullable: true,
    },
    permissions: {
      type: 'array',
      items: {
        type: 'string',
        enum: permissions,
      },
    },
    expires: {
      type: 'string',
      format: 'date-time',
      nullable: true,
    },
    revoked: {
      type: 'boolean',
    },
  },
});

export const authApiKeyCreateSchema = asJsonSchema({
  type: 'object',
  additionalProperties: false,
  required: ['permissions'],
  properties: {
    description: {
      type: 'string',
    },
    permissions: {
      type: 'array',
      items: {
        type: 'string',
        enum: permissions,
      },
    },
    expires: {
      type: 'string',
      format: 'date-time',
    },
  },
});
