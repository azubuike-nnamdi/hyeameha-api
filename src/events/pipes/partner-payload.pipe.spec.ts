import { BadRequestException } from '@nestjs/common';
import { PartnerPayloadPipe } from './partner-payload.pipe';

describe('PartnerPayloadPipe', () => {
  const pipe = new PartnerPayloadPipe();

  it('passes through a normal JSON object as a copy', () => {
    const body = { tickets: [{ id: 1, quantity: 2 }], email: 'a@b.com' };
    const result = pipe.transform(body);
    expect(result).toEqual(body);
    expect(result).not.toBe(body);
  });

  it.each([null, 'str', 42, [1, 2]])('rejects non-object body %p', (value) => {
    expect(() => pipe.transform(value)).toThrow(BadRequestException);
  });

  it('rejects prototype-pollution keys', () => {
    const body = JSON.parse('{"a":{"__proto__":{"admin":true}}}') as unknown;
    expect(() => pipe.transform(body)).toThrow(BadRequestException);
  });

  it('rejects oversized bodies', () => {
    expect(() => pipe.transform({ blob: 'x'.repeat(20_000) })).toThrow(
      BadRequestException,
    );
  });

  it('rejects deeply nested bodies', () => {
    const deep = { a: { b: { c: { d: { e: { f: { g: 1 } } } } } } };
    expect(() => pipe.transform(deep)).toThrow(BadRequestException);
  });
});
