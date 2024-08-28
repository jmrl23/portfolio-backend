import { FastifyRequest } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import ms from 'ms';
import { createTransport } from 'nodemailer';
import { asRoute } from '../../lib/common';
import { SMTP_URL } from '../../lib/constant/env';
import { emailSendSchema } from './emailsSchema';
import { EmailsService } from './emailsService';

export default asRoute(async function (app) {
  const transporter = createTransport({
    url: SMTP_URL,
  });
  const emailsService = new EmailsService(transporter);

  app.route({
    method: 'POST',
    url: '/send',
    config: {
      rateLimit: {
        max: 5,
        timeWindow: ms('5m'),
      },
    },
    schema: {
      description: 'Send email',
      tags: ['emails'],
      body: emailSendSchema,
      response: {
        200: {
          description: 'Send email info',
          type: 'object',
          required: ['data'],
          properties: {
            data: {
              type: 'object',
              additionalProperties: false,
              required: ['messageId'],
              messageId: {
                type: 'string',
              },
            },
          },
        },
      },
    },
    async handler(
      request: FastifyRequest<{
        Body: FromSchema<typeof emailSendSchema>;
      }>,
    ) {
      const messageId = await emailsService.sendMail(request.body);
      return {
        data: {
          messageId,
        },
      };
    },
  });
});
