import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

const MAX_PAYLOAD_BYTES = 16 * 1024;
const MAX_DEPTH = 5;
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Guards bodies forwarded to the eGotickets partner API. The partner contract is not
 * modelled here, so this enforces shape limits only: a plain JSON object, bounded size and
 * depth, and no prototype-pollution keys. Returns a clean deep copy.
 */
@Injectable()
export class PartnerPayloadPipe implements PipeTransform<
  unknown,
  Record<string, unknown>
> {
  transform(value: unknown): Record<string, unknown> {
    if (!isPlainObject(value)) {
      throw new BadRequestException('Request body must be a JSON object');
    }
    if (JSON.stringify(value).length > MAX_PAYLOAD_BYTES) {
      throw new BadRequestException('Request body is too large');
    }
    return sanitize(value, 0) as Record<string, unknown>;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype ||
      Object.getPrototypeOf(value) === null)
  );
}

function sanitize(value: unknown, depth: number): unknown {
  if (depth > MAX_DEPTH) {
    throw new BadRequestException('Request body is nested too deeply');
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item, depth + 1));
  }
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      if (FORBIDDEN_KEYS.has(key)) {
        throw new BadRequestException(`Field "${key}" is not allowed`);
      }
      out[key] = sanitize(child, depth + 1);
    }
    return out;
  }
  return value;
}
