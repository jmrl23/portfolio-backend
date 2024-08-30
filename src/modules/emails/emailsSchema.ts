import { asJsonSchema } from '../../lib/common';
import { SMTP_URL } from '../../lib/constant/env';

const smtp = new URL(SMTP_URL);
export const emailSendSchema = asJsonSchema({
  type: 'object',
  additionalProperties: false,
  required: ['to', 'subject'],
  properties: {
    from: {
      type: 'string',
      examples: [decodeURIComponent(smtp.username)],
    },
    to: {
      type: 'array',
      items: {
        type: 'string',
        format: 'email',
        examples: ['gaiterajomariel@gmail.com'],
      },
    },
    subject: {
      type: 'string',
      examples: ['portfolio'],
    },
    text: {
      type: 'string',
      examples: ['hello, world!'],
    },
    html: {
      type: 'string',
      examples: ['<h1>hello, world!</h1>'],
    },
    attachments: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['path'],
        properties: {
          path: {
            type: 'string',
            format: 'uri',
          },
        },
      },
    },
  },
});

export const emailSentSchema = asJsonSchema({
  type: 'object',
  additionalProperties: false,
  required: ['id', 'accepted'],
  properties: {
    id: {
      type: 'string',
    },
    accepted: {
      type: 'array',
      items: {
        oneOf: [
          {
            type: 'string',
            format: 'email',
          },
          {
            type: 'object',
            additionalProperties: false,
            required: ['name', 'address'],
            properties: {
              name: {
                type: 'string',
              },
              address: {
                type: 'string',
              },
            },
          },
        ],
      },
    },
  },
});
