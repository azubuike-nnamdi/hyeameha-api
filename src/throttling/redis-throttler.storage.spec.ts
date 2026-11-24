import type Redis from 'ioredis';
import { RedisThrottlerStorage } from './redis-throttler.storage';

describe('RedisThrottlerStorage', () => {
  const evalMock = jest.fn();
  const storage = new RedisThrottlerStorage({
    eval: evalMock,
  } as unknown as Redis);

  beforeEach(() => jest.clearAllMocks());

  it('reports hits and seconds until the window resets', async () => {
    evalMock.mockResolvedValue([2, 59_100, -2]);
    await expect(
      storage.increment('ip', 60_000, 5, 0, 'auth'),
    ).resolves.toEqual({
      totalHits: 2,
      timeToExpire: 60,
      isBlocked: false,
      timeToBlockExpire: 0,
    });
    expect(evalMock).toHaveBeenCalledWith(
      expect.any(String),
      2,
      'throttle:auth:ip:hits',
      'throttle:auth:ip:block',
      '60000',
      '5',
      '60000',
    );
  });

  it('reports a block once over the limit', async () => {
    evalMock.mockResolvedValue([6, 30_000, 60_000]);
    const record = await storage.increment('ip', 60_000, 5, 60_000, 'auth');
    expect(record.isBlocked).toBe(true);
    expect(record.timeToBlockExpire).toBe(60);
  });

  it('fails open when Redis is unavailable', async () => {
    evalMock.mockRejectedValue(new Error('ECONNREFUSED'));
    const record = await storage.increment('ip', 60_000, 5, 0, 'default');
    expect(record.isBlocked).toBe(false);
  });
});
