import { asJsonSchema } from '../../lib/common';
import { SMTP_URL } from '../../lib/constant/env';

const smtp = new URL(SMTP_URL);
const email = decodeURIComponent(smtp.username);
export const emailSendSchema = asJsonSchema({
  type: 'object',
  additionalProperties: false,
  properties: {
    from: {
      type: 'string',
      examples: [email],
      default: email,
    },
    to: {
      type: 'array',
      items: {
        type: 'string',
        format: 'email',
        examples: [email],
        default: [email],
      },
    },
    subject: {
      type: 'string',
      examples: ['portfolio'],
      default: 'portfolio',
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
