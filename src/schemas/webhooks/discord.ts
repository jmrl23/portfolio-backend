import { FromSchema } from 'json-schema-to-ts';
import { asJsonSchema } from '../../lib/common';

export const discordSendMessageSchema = asJsonSchema({
  type: 'object',
  required: ['content'],
  properties: {
    content: {
      type: 'string',
      minLength: 1,
    },
  },
});
export type DiscordSendMessage = FromSchema<typeof discordSendMessageSchema>;
