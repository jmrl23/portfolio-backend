import { FromSchema } from 'json-schema-to-ts';
import { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { emailSendSchema } from './emailsSchema';

type SendMailPayload = FromSchema<typeof emailSendSchema>;

export class EmailsService {
  constructor(
    private readonly transporter: Transporter<SMTPTransport.SentMessageInfo>,
  ) {}

  public async sendMail(payload: SendMailPayload): Promise<string> {
    const response = await this.transporter.sendMail(payload);
    return response.messageId;
  }
}
