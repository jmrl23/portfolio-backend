import { FastifyRequest } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';
import ms from 'ms';
import { createTransport } from 'nodemailer';
import { asRoute } from '../../lib/common';
import { SMTP_URL } from '../../lib/constant/env';
import { emailSendSchema, emailSentSchema } from './emailsSchema';
import { EmailsService } from './emailsService';
import { authApiPermissionHandler } from '../auth/authPreHandler';

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
        max: 10,
        timeWindow: ms('10m'),
      },
    },
    schema: {
      description: 'send email',
      security: [{ bearerAuth: [] }],
      tags: ['emails'],
      body: emailSendSchema,
      response: {
        200: {
          description: 'sent email info',
          type: 'object',
          required: ['data'],
          properties: {
            data: emailSentSchema,
          },
        },
      },
    },
    preHandler: [authApiPermissionHandler('emails.write')],
    async handler(
      request: FastifyRequest<{
        Body: FromSchema<typeof emailSendSchema>;
      }>,
    ) {
      const sentEmail = await emailsService.sendMail(request.body);
      return {
        data: sentEmail,
      };
    },
  });
});
