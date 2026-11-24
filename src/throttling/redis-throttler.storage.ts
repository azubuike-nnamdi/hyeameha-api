import { Logger } from '@nestjs/common';
import type { ThrottlerStorage } from '@nestjs/throttler';
import type Redis from 'ioredis';

type ThrottlerStorageRecord = Awaited<
  ReturnType<ThrottlerStorage['increment']>
>;

/**
 * Fixed-window counter plus block key, run atomically in Redis so limits hold
 * across multiple API instances.
 *
 * KEYS[1] = hit counter, KEYS[2] = block marker
 * ARGV[1] = ttl ms, ARGV[2] = limit, ARGV[3] = block duration ms
 * Returns { hits, counterTtlMs, blockTtlMs }.
 */
const INCREMENT_SCRIPT = `
local hits = redis.call('INCR', KEYS[1])
if hits == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('PTTL', KEYS[1])
local blockTtl = redis.call('PTTL', KEYS[2])
if blockTtl <= 0 and hits > tonumber(ARGV[2]) then
  redis.call('SET', KEYS[2], '1', 'PX', ARGV[3])
  blockTtl = tonumber(ARGV[3])
end
return { hits, ttl, blockTtl }
`;

export class RedisThrottlerStorage implements ThrottlerStorage {
  private readonly logger = new Logger(RedisThrottlerStorage.name);

  constructor(
    private readonly redis: Redis,
    private readonly keyPrefix = 'throttle',
  ) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const base = `${this.keyPrefix}:${throttlerName}:${key}`;
    const effectiveBlock = blockDuration > 0 ? blockDuration : ttl;
    try {
      const [hits, counterTtl, blockTtl] = (await this.redis.eval(
        INCREMENT_SCRIPT,
        2,
        `${base}:hits`,
        `${base}:block`,
        String(ttl),
        String(limit),
        String(effectiveBlock),
      )) as [number, number, number];

      const isBlocked = blockTtl > 0;
      return {
        totalHits: hits,
        timeToExpire: Math.max(0, Math.ceil(counterTtl / 1000)),
        isBlocked,
        timeToBlockExpire: isBlocked ? Math.ceil(blockTtl / 1000) : 0,
      };
    } catch (error: unknown) {
      // Fail open: a Redis outage must not take the whole API down.
      this.logger.debug(
        `Rate-limit storage unavailable; allowing request: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return {
        totalHits: 0,
        timeToExpire: 0,
        isBlocked: false,
        timeToBlockExpire: 0,
      };
    }
  }
}
