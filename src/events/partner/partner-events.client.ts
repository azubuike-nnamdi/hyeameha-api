import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import type { PartnerEvent } from '../types/partner-event.types';
import {
  normalizePartnerEvent,
  normalizePartnerEventsList,
} from './normalize-partner-events.util';

@Injectable()
export class PartnerEventsClient {
  private readonly logger = new Logger(PartnerEventsClient.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
  ) {
    this.baseUrl = config
      .getOrThrow<string>('EVENT_BASE_URL')
      .replace(/\/$/, '');
    this.apiKey = config.getOrThrow<string>('EVENT_API_KEY');
  }

  async listEvents(): Promise<PartnerEvent[]> {
    const payload = await this.request<unknown>(
      'GET',
      '/apis/partner-api/events',
    );
    const events = normalizePartnerEventsList(payload);
    if (events.length === 0 && payload != null) {
      this.logger.warn(
        'Partner events list returned no recognizable events; check EVENT_BASE_URL, EVENT_API_KEY, and response shape',
      );
    }
    return events;
  }

  async getEvent(eventId: string): Promise<PartnerEvent> {
    const payload = await this.request<unknown>(
      'GET',
      `/apis/partner-api/events/${encodeURIComponent(eventId)}`,
    );
    const event = normalizePartnerEvent(payload);
    if (!event) {
      this.logger.error(
        `Partner event ${eventId} response was not a recognizable event payload`,
      );
      throw new BadGatewayException('Invalid partner event response');
    }
    return event;
  }

  async calculateCharges(
    eventId: string,
    body: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(
      'POST',
      `/apis/partner-api/events/${encodeURIComponent(eventId)}/calculate_charges`,
      body,
    );
  }

  async buyTicket(
    eventId: string,
    body: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(
      'POST',
      `/apis/partner-api/events/${encodeURIComponent(eventId)}/buy_ticket`,
      body,
    );
  }

  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: Record<string, unknown>,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    try {
      const response = await firstValueFrom(
        this.http.request<T>({
          method,
          url,
          headers: { Authorization: this.authorizationHeader() },
          data: body,
        }),
      );
      return response.data;
    } catch (error: unknown) {
      this.throwPartnerError(error);
    }
  }

  private authorizationHeader(): string {
    const key = this.apiKey.trim();
    return /^bearer\s/i.test(key) ? key : `Bearer ${key}`;
  }

  /**
   * Maps partner failures to our own status codes. The partner's status is never passed
   * through (a partner 401 would look like the client's session expired) and only a short
   * message string is forwarded, never the raw partner body.
   */
  private throwPartnerError(error: unknown): never {
    if (this.isAxiosError(error) && error.response) {
      const status = error.response.status;
      const message = this.extractPartnerMessage(error.response.data);
      if (status === 404) {
        throw new NotFoundException(message ?? 'Event not found');
      }
      if (status >= 400 && status < 500 && status !== 401 && status !== 403) {
        throw new BadRequestException(message ?? 'Request rejected by partner');
      }
      this.logger.error(
        `Partner events API returned ${status}${message ? `: ${message}` : ''}`,
      );
      throw new BadGatewayException('Partner events API is unavailable');
    }
    this.logger.error(
      'Partner events API request failed',
      error instanceof Error ? error.message : String(error),
    );
    throw new BadGatewayException('Partner events API is unavailable');
  }

  private extractPartnerMessage(data: unknown): string | undefined {
    let message: unknown;
    if (typeof data === 'string') {
      message = data;
    } else if (typeof data === 'object' && data !== null) {
      const record = data as Record<string, unknown>;
      message = record.message ?? record.error;
    }
    return typeof message === 'string' && message.trim()
      ? message.trim().slice(0, 300)
      : undefined;
  }

  private isAxiosError(error: unknown): error is AxiosError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'isAxiosError' in error &&
      (error as AxiosError).isAxiosError === true
    );
  }
}
