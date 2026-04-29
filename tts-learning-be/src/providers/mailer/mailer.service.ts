import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { SendMailOptions } from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(
    private readonly mailerService: NestMailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendMail(options: SendMailOptions): Promise<void> {
    const defaultFrom = this.configService.get<string>('mailer.from');

    await this.mailerService.sendMail({
      ...options,
      from: options.from ?? defaultFrom,
    });

    this.logger.log(`[MailerService] Mail sent to: ${String(options.to)}`);
  }

  async sendTextMail(to: string, subject: string, text: string): Promise<void> {
    await this.sendMail({
      to,
      subject,
      text,
    });
  }
}
