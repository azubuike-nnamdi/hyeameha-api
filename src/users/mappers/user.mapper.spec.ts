import { toUserResponseDto } from './user.mapper';

describe('toUserResponseDto', () => {
  it('maps only public user fields', () => {
    const user = {
      id: 'u1',
      firstName: 'A',
      lastName: 'B',
      email: 'a@b.com',
      phone: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const dto = toUserResponseDto(user);
    expect(dto.id).toBe('u1');
    expect((dto as { passwordHash?: string }).passwordHash).toBeUndefined();
    expect(
      (dto as { refreshTokenHash?: string }).refreshTokenHash,
    ).toBeUndefined();
  });
});
