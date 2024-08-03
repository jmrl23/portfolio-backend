import { FastifyRequest } from 'fastify';
import ms from 'ms';
import { asRoute } from '../../lib/common';
import { DISCORD_WEBHOOK_URL } from '../../lib/constant/env';
import {
  DiscordSendMessage,
  discordSendMessageSchema,
} from '../../schemas/webhooks/discord';

export const prefix = '/webhooks/discord';

export default asRoute(async function discordRoute(app) {
  app.route({
    method: 'post',
    url: '/send-message',
    schema: {
      description: 'Send message to discord',
      tags: ['webhook', 'discord'],
      body: discordSendMessageSchema,
      responses: {
        200: {
          type: 'object',
          required: ['ok'],
          properties: {
            ok: {
              type: 'boolean',
            },
          },
        },
      },
    },
    config: {
      rateLimit: {
        max: 2,
        timeWindow: ms('1m'),
      },
    },
    async handler(
      request: FastifyRequest<{
        Body: DiscordSendMessage;
      }>,
    ) {
      await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          content: request.body.content,
        }),
      });
      return {
        ok: true,
      };
    },
  });
});
