import { FromSchema } from 'json-schema-to-ts';
import { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { emailSendSchema, emailSentSchema } from './emailsSchema';

type SendMailPayload = FromSchema<typeof emailSendSchema>;
type SentEmail = FromSchema<typeof emailSentSchema>;

export class EmailsService {
  constructor(
    private readonly transporter: Transporter<SMTPTransport.SentMessageInfo>,
  ) {}

  public async sendMail(payload: SendMailPayload): Promise<SentEmail> {
    const response = await this.transporter.sendMail(payload);
    const accepted = Array.isArray(response.accepted)
      ? response.accepted
      : [response.accepted];
    return {
      id: response.messageId,
      accepted,
    };
  }
}
