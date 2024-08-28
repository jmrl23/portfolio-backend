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
      default: smtp.username,
    },
    to: {
      type: 'array',
      items: {
        type: 'string',
        format: 'email',
      },
    },
    subject: {
      type: 'string',
    },
    text: {
      type: 'string',
    },
    html: {
      type: 'string',
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
