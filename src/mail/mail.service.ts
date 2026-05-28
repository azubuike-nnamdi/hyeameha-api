import {
  BadGatewayException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { LoginContext } from '../auth/utils/login-context.util';
import { ApiFailureLoggerService } from '../logging/api-failure-logger.service';
import {
  loginAlertEmailHtml,
  passwordResetOtpEmailHtml,
  welcomeEmailHtml,
} from './mail.templates';

type AltermailSendResponse = {
  Status?: string;
  messageId?: string;
  toEmail?: string;
  message?: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly failureLogger: ApiFailureLoggerService,
  ) {}

  async sendWelcomeEmail(
    to: string,
    firstName: string,
    userId?: string | null,
  ): Promise<void> {
    const html = welcomeEmailHtml(firstName);
    await this.send({
      to,
      subject: 'Welcome to Hyeameha',
      html,
      text: this.htmlToPlainText(html),
      logTag: 'mail-register',
      userId,
    });
  }

  async sendLoginAlertEmail(
    to: string,
    firstName: string,
    context: LoginContext,
  ): Promise<void> {
    const html = loginAlertEmailHtml(firstName, context.locationSummary);
    await this.send({
      to,
      subject: 'New sign-in to your Hyeameha account',
      html,
      text: this.htmlToPlainText(html),
      logTag: 'mail-login',
      userId: null,
    });
  }

  async sendPasswordResetOtpEmail(
    to: string,
    firstName: string,
    otp: string,
    expiresMinutes: number,
    userId?: string | null,
  ): Promise<void> {
    const html = passwordResetOtpEmailHtml(firstName, otp, expiresMinutes);
    await this.send({
      to,
      subject: 'Your Hyeameha password reset code',
      html,
      text: this.htmlToPlainText(html),
      logTag: 'mail-forgot-password',
      userId,
    });
  }

  private async send(options: {
    to: string;
    subject: string;
    html: string;
    text: string;
    logTag: string;
    userId?: string | null;
  }): Promise<void> {
    if (!this.isMailEnabled()) {
      this.logger.debug(
        `Mail skipped (MAIL_ENABLED=false): ${options.subject} → ${options.to}`,
      );
      return;
    }

    const url = this.config.get<string>(
      'ALTERMAIL_API_URL',
      'https://api.altermail-console.com.ng/v1/user/email/send',
    );

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: this.config.getOrThrow<string>('ALTER_MAIL_KEY'),
        },
        body: JSON.stringify({
          email: options.to,
          fromEmail: this.config.getOrThrow<string>('MAIL_FROM'),
          subject: options.subject,
          mailBodyHtml: options.html,
          mailBodyText: options.text,
        }),
      });

      const rawBody = await response.text();
      const fromEmail = this.config.getOrThrow<string>('MAIL_FROM');

      if (!response.ok) {
        const apiMessage = this.parseAltermailErrorMessage(rawBody);
        if (
          response.status === 403 &&
          apiMessage.toLowerCase().includes('domain')
        ) {
          this.logger.error(
            `Altermail rejected sender "${fromEmail}": ${apiMessage}. ` +
              'Verify the domain in the Altermail console and set MAIL_FROM to an approved from address.',
          );
        }
        this.recordAltermailFailure({
          logTag: options.logTag,
          url,
          statusCode: response.status,
          rawBody,
          to: options.to,
          fromEmail,
          subject: options.subject,
          userId: options.userId,
        });
        throw new BadGatewayException('Failed to send email');
      }

      const data = rawBody
        ? (JSON.parse(rawBody) as AltermailSendResponse)
        : {};
      if (data.message && !data.messageId && !data.Status) {
        this.recordAltermailFailure({
          logTag: options.logTag,
          url,
          statusCode: response.status,
          rawBody,
          to: options.to,
          fromEmail,
          subject: options.subject,
          userId: options.userId,
        });
        throw new BadGatewayException('Failed to send email');
      }
      this.logger.log(
        `Email queued via Altermail: ${options.subject} → ${options.to} (${data.messageId ?? data.Status ?? 'ok'})`,
      );
    } catch (error: unknown) {
      if (error instanceof BadGatewayException) {
        throw error;
      }
      const detail = error instanceof Error ? error.message : String(error);
      this.recordAltermailFailure({
        logTag: options.logTag,
        url,
        statusCode: HttpStatus.BAD_GATEWAY,
        rawBody: '',
        to: options.to,
        fromEmail: this.config.getOrThrow<string>('MAIL_FROM'),
        subject: options.subject,
        userId: options.userId,
        fallbackMessage: detail,
      });
      this.logger.error(
        `Failed to send email (${options.subject} → ${options.to}): ${detail}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new BadGatewayException('Failed to send email');
    }
  }

  private recordAltermailFailure(params: {
    logTag: string;
    url: string;
    statusCode: number;
    rawBody: string;
    to: string;
    fromEmail: string;
    subject: string;
    userId?: string | null;
    fallbackMessage?: string;
  }): void {
    const responseBody = this.parseAltermailResponseBody(
      params.rawBody,
      params.fallbackMessage,
    );
    this.failureLogger.recordFailureSafe({
      tag: params.logTag,
      method: 'POST',
      path: params.url,
      statusCode: params.statusCode,
      responseBody,
      requestBody: {
        email: params.to,
        fromEmail: params.fromEmail,
        subject: params.subject,
      },
      userId: params.userId ?? null,
      correlationId: null,
      ipAddress: null,
    });
  }

  private parseAltermailResponseBody(
    rawBody: string,
    fallbackMessage?: string,
  ): Record<string, unknown> {
    if (rawBody) {
      try {
        return JSON.parse(rawBody) as Record<string, unknown>;
      } catch {
        return { message: rawBody };
      }
    }
    return { message: fallbackMessage ?? 'Altermail request failed' };
  }

  private isMailEnabled(): boolean {
    return this.config.get<string>('MAIL_ENABLED', 'true') === 'true';
  }

  private parseAltermailErrorMessage(rawBody: string): string {
    if (!rawBody) {
      return '';
    }
    try {
      const parsed = JSON.parse(rawBody) as { message?: string };
      return parsed.message?.trim() ?? rawBody;
    } catch {
      return rawBody;
    }
  }

  /** Rough HTML → plain text for Altermail `mailBodyText`. */
  private htmlToPlainText(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}
