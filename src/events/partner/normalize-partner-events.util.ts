import type { PartnerEvent } from '../types/partner-event.types';

function isPartnerEvent(value: unknown): value is PartnerEvent {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    typeof (value as PartnerEvent).id === 'number'
  );
}

/** Unwraps partner list payloads (raw array, or `{ data }` / `{ events }` envelopes). */
export function normalizePartnerEventsList(payload: unknown): PartnerEvent[] {
  if (Array.isArray(payload)) {
    return payload.filter(isPartnerEvent);
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const nested = record.data ?? record.events ?? record.results;
    if (Array.isArray(nested)) {
      return nested.filter(isPartnerEvent);
    }
    if (isPartnerEvent(record)) {
      return [record];
    }
  }

  return [];
}

/** Unwraps a single partner event (`data` envelope or raw object). */
export function normalizePartnerEvent(payload: unknown): PartnerEvent | null {
  if (isPartnerEvent(payload)) {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const nested = record.data ?? record.event;
    if (isPartnerEvent(nested)) {
      return nested;
    }
  }

  return null;
}
