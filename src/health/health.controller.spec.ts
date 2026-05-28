import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('returns ok when database query succeeds', async () => {
    const dataSource = { query: jest.fn().mockResolvedValue(undefined) };
    const controller = new HealthController(dataSource as never);
    const result = await controller.check();
    expect(result).toEqual({
      statusCode: 200,
      message: 'Service is healthy',
      data: { status: 'ok', database: 'connected' },
    });
    expect(dataSource.query).toHaveBeenCalledWith('SELECT 1');
  });
});
