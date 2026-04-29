import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MailerService } from '../../../providers/mailer/mailer.service';
import { EmailTemplateService } from '../../system/services/email-template.service';
import { InterviewStatus } from '@/common/constants/status.enum';
import { Interview } from '../entities/interview.entity';
import { randomUUID } from 'crypto';
import pLimit from 'p-limit';

interface TemplateMailRecipient {
  email: string;
  fullName: string;
  [key: string]: string | undefined;
}

interface DirectMailRecipient {
  email: string;
  fullName: string;
  htmlBody: string;
  [key: string]: string | undefined;
}

export interface MailDeliveryDetail {
  email: string;
  status: 'sent' | 'failed';
  error?: string;
}

export interface BatchMailResult {
  total: number;
  success: number;
  failed: number;
  details: MailDeliveryDetail[];
}

@Injectable()
export class BatchMailService {
  private readonly logger = new Logger(BatchMailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly templateService: EmailTemplateService,
  ) {}

  /**
   * Gửi email hàng loạt cho danh sách ứng viên dựa trên template code
   */
  async sendBatchEmail(templateCode: string, recipients: TemplateMailRecipient[]): Promise<BatchMailResult> {
    const template = await this.templateService.findByCode(templateCode);

    if (!template) {
      throw new NotFoundException(`Không tìm thấy mẫu Email có mã: ${templateCode} đâu bạn ơi!`);
    }

    this.logger.log(`[BatchMailService] Đang bắt đầu gửi ${recipients.length} email mẫu ${templateCode}...`);

    const results: BatchMailResult = {
      total: recipients.length,
      success: 0,
      failed: 0,
      details: [],
    };

    for (const recipient of recipients) {
      try {
        let body = template.body;
        let subject = template.subject;

        // Thay thế các biến trong body và subject
        Object.entries(recipient).forEach(([key, value]) => {
          if (typeof value !== 'string' || value.length === 0) {
            return;
          }

          const placeholder = new RegExp(`{{${this.escapeRegExp(key)}}}`, 'g');
          body = body.replace(placeholder, value);
          subject = subject.replace(placeholder, value);
        });

        await this.mailerService.sendMail({
          to: recipient.email,
          subject,
          html: body,
        });

        results.success++;
        results.details.push({ email: recipient.email, status: 'sent' });
      } catch (error) {
        const message = this.getErrorMessage(error);
        this.logger.error(`[BatchMailService] Lỗi gửi mail cho ${recipient.email}: ${message}`);
        results.failed++;
        results.details.push({ email: recipient.email, status: 'failed', error: message });
      }
    }

    this.logger.log(`[BatchMailService] Hoàn tất! Thành công: ${results.success}, Thất bại: ${results.failed}`);
    return results;
  }

  /**
   * Gửi email hàng loạt với nội dung đã render sẵn từ FE (không cần lookup template DB)
   */
  async sendDirectBatchEmail(subject: string, recipients: DirectMailRecipient[]): Promise<BatchMailResult> {
    this.logger.log(`[BatchMailService] Gửi trực tiếp ${recipients.length} email...`);

    const results: BatchMailResult = { total: recipients.length, success: 0, failed: 0, details: [] };

    for (const recipient of recipients) {
      try {
        let renderedSubject = subject;
        let renderedBody = recipient.htmlBody;

        Object.entries(recipient).forEach(([key, value]) => {
          if (key === 'email' || key === 'htmlBody' || typeof value !== 'string' || value.length === 0) {
            return;
          }

          const aliases = this.getPlaceholderAliases(key);
          aliases.forEach((alias) => {
            const singleBracePlaceholder = new RegExp(`\\{${this.escapeRegExp(alias)}\\}`, 'g');
            const doubleBracePlaceholder = new RegExp(`\\{\\{${this.escapeRegExp(alias)}\\}\\}`, 'g');
            renderedBody = renderedBody.replace(singleBracePlaceholder, value).replace(doubleBracePlaceholder, value);
            renderedSubject = renderedSubject
              .replace(singleBracePlaceholder, value)
              .replace(doubleBracePlaceholder, value);
          });
        });

        await this.mailerService.sendMail({
          to: recipient.email,
          subject: renderedSubject,
          html: renderedBody,
        });
        results.success++;
        results.details.push({ email: recipient.email, status: 'sent' });
      } catch (error) {
        const message = this.getErrorMessage(error);
        this.logger.error(`[BatchMailService] Lỗi gửi mail cho ${recipient.email}: ${message}`);
        results.failed++;
        results.details.push({ email: recipient.email, status: 'failed', error: message });
      }
    }

    this.logger.log(`[BatchMailService] Hoàn tất! Thành công: ${results.success}, Thất bại: ${results.failed}`);
    return results;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown mail delivery error';
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private getPlaceholderAliases(key: string): string[] {
    const snakeCase = key
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .replace(/\s+/g, '_')
      .toLowerCase();
    const pascalCase = key.charAt(0).toUpperCase() + key.slice(1);
    const titleSnakeCase = snakeCase
      .split('_')
      .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : part))
      .join('_');

    return Array.from(new Set([key, snakeCase, pascalCase, titleSnakeCase]));
  }

  // async sendInviteWithTransaction(
  //   subject: string,
  //   recipients: DirectMailRecipient[],
  //   dataSource: any,
  // ): Promise<BatchMailResult> {
  //   return await dataSource.transaction(async (manager) => {
  //     const results: BatchMailResult = {
  //       total: recipients.length,
  //       success: 0,
  //       failed: 0,
  //       details: [],
  //     };

  //     for (const recipient of recipients) {
  //       try {
  //         if (!recipient.interviewId) {
  //           throw new Error(`Missing interviewId for ${recipient.email}`);
  //         }

  //         const token = randomUUID();

  //         await manager.update(
  //           Interview,
  //           { id: recipient.interviewId },
  //           {
  //             isSent: true,
  //             actionToken: token,
  //             tokenUsed: false,
  //           },
  //         );

  //         let renderedSubject = subject;
  //         let renderedBody = recipient.htmlBody;

  //         Object.entries(recipient).forEach(([key, value]) => {
  //           if (key === 'email' || key === 'htmlBody' || key === 'interviewId' || typeof value !== 'string') {
  //             return;
  //           }

  //           const aliases = this.getPlaceholderAliases(key);

  //           aliases.forEach((alias) => {
  //             const singleBrace = new RegExp(`\\{${this.escapeRegExp(alias)}\\}`, 'g');
  //             const doubleBrace = new RegExp(`\\{\\{${this.escapeRegExp(alias)}\\}\\}`, 'g');

  //             renderedBody = renderedBody.replace(singleBrace, value).replace(doubleBrace, value);

  //             renderedSubject = renderedSubject.replace(singleBrace, value).replace(doubleBrace, value);
  //           });
  //         });

  //         renderedBody = renderedBody.replace(/\{Token\}/g, token);

  //         await this.mailerService.sendMail({
  //           to: recipient.email,
  //           subject: renderedSubject,
  //           html: renderedBody,
  //         });

  //         results.success++;
  //         results.details.push({ email: recipient.email, status: 'sent' });
  //       } catch (error) {
  //         throw new Error(`Fail at ${recipient.email}: ${this.getErrorMessage(error)}`);
  //       }
  //     }

  //     return results;
  //   });
  // }

  async sendInviteWithTransaction(
    subject: string,
    recipients: DirectMailRecipient[],
    dataSource: any,
  ): Promise<BatchMailResult> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await dataSource.transaction(async (manager) => {
      const results: BatchMailResult = {
        total: recipients.length,
        success: 0,
        failed: 0,
        details: [],
      };

      const limit = pLimit(2); 

      const tasks = recipients.map((recipient) =>
        limit(async () => {
          try {
            if (!recipient.interviewId) {
              throw new Error(`Missing interviewId for ${recipient.email}`);
            }

            const token = randomUUID();

            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            await manager.update(
              Interview,
              { id: recipient.interviewId },
              {
                isSent: true,
                actionToken: token,
                tokenUsed: false,
              },
            );

            let renderedSubject = subject;
            let renderedBody = recipient.htmlBody;

            Object.entries(recipient).forEach(([key, value]) => {
              if (key === 'email' || key === 'htmlBody' || key === 'interviewId' || typeof value !== 'string') {
                return;
              }

              const aliases = this.getPlaceholderAliases(key);

              aliases.forEach((alias) => {
                const singleBrace = new RegExp(`\\{${this.escapeRegExp(alias)}\\}`, 'g');
                const doubleBrace = new RegExp(`\\{\\{${this.escapeRegExp(alias)}\\}\\}`, 'g');

                renderedBody = renderedBody.replace(singleBrace, value).replace(doubleBrace, value);
                renderedSubject = renderedSubject.replace(singleBrace, value).replace(doubleBrace, value);
              });
            });

            renderedBody = renderedBody.replace(/\{Token\}/g, token);

            await this.mailerService.sendMail({
              to: recipient.email,
              subject: renderedSubject,
              html: renderedBody,
            });

            return { email: recipient.email, status: 'sent' as const };
          } catch (error) {
            return {
              email: recipient.email,
              status: 'failed' as const,
              error: this.getErrorMessage(error),
            };
          }
        }),
      );

      const responses = await Promise.all(tasks);

      responses.forEach((res) => {
        if (res.status === 'sent') {
          results.success++;
        } else {
          results.failed++;
        }
        results.details.push(res);
      });

      return results;
    });
  }
}
