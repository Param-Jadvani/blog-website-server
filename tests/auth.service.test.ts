jest.mock('argon2', () => ({
  __esModule: true,
  default: { verify: jest.fn() },
}));

jest.mock('@/services/v2/parent.service', () => ({
  __esModule: true,
  default: class ParentService {},
}));

jest.mock('@/lib/jwt', () => ({
  generateAccessToken: jest.fn(() => 'access-token'),
  generateRefreshToken: jest.fn(() => 'refresh-token'),
  verifyRefreshToken: jest.fn(),
}));

import argon2 from 'argon2';
import { Types } from 'mongoose';
import AuthService from '@/services/v2/auth.service';
import { AuthError, ValidationError } from '@/lib/errors';
import { generateAccessToken, verifyRefreshToken } from '@/lib/jwt';

const user = {
  _id: new Types.ObjectId(),
  username: 'user-one',
  email: 'user@example.com',
  password: 'hashed-password',
  role: 'user',
};

describe('AuthService', () => {
  const createService = () => {
    const service = new AuthService() as any;
    service.userRepo = {
      findByEmail: jest.fn(),
      findByEmailWithPassword: jest.fn(),
      createUser: jest.fn(),
    };
    service.tokenRepo = {
      saveToken: jest.fn(),
      findByToken: jest.fn(),
      deleteToken: jest.fn(),
    };
    return service;
  };

  it('registers a normal user and persists the generated refresh token', async () => {
    const service = createService();
    service.userRepo.findByEmail.mockResolvedValue(null);
    service.userRepo.createUser.mockResolvedValue(user);

    await expect(
      service.register({
        email: user.email,
        password: 'password123',
        username: user.username,
      }),
    ).resolves.toEqual({
      user: { username: user.username, email: user.email, role: 'user' },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    expect(service.userRepo.createUser).toHaveBeenCalledWith({
      email: user.email,
      password: 'password123',
      username: user.username,
      role: 'user',
    });
    expect(service.tokenRepo.saveToken).toHaveBeenCalledWith(
      user._id,
      'refresh-token',
    );
  });

  it('rejects duplicate registrations', async () => {
    const service = createService();
    service.userRepo.findByEmail.mockResolvedValue(user);

    await expect(
      service.register({
        email: user.email,
        password: 'password123',
        username: 'new-user',
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('rejects bad credentials and creates tokens only after password verification', async () => {
    const service = createService();
    service.userRepo.findByEmailWithPassword.mockResolvedValue(user);
    (argon2.verify as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login({ email: user.email, password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(AuthError);
    expect(service.tokenRepo.saveToken).not.toHaveBeenCalled();
  });

  it('logs in valid users and rejects unknown accounts', async () => {
    const service = createService();
    service.userRepo.findByEmailWithPassword.mockResolvedValue(null);
    await expect(
      service.login({ email: user.email, password: 'password123' }),
    ).rejects.toBeInstanceOf(AuthError);

    service.userRepo.findByEmailWithPassword.mockResolvedValue(user);
    (argon2.verify as jest.Mock).mockResolvedValue(true);
    await expect(
      service.login({ email: user.email, password: 'password123' }),
    ).resolves.toEqual({
      user: { username: user.username, email: user.email, role: 'user' },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  it('issues a new access token only for a persisted refresh token', async () => {
    const service = createService();
    service.tokenRepo.findByToken.mockResolvedValue({ userId: user._id });
    (verifyRefreshToken as jest.Mock).mockReturnValue({ userId: user._id });

    await expect(service.refreshToken('refresh-token')).resolves.toBe(
      'access-token',
    );
    expect(generateAccessToken).toHaveBeenCalledWith(user._id);

    service.tokenRepo.findByToken.mockResolvedValue(null);
    await expect(service.refreshToken('refresh-token')).rejects.toBeInstanceOf(
      AuthError,
    );
  });

  it('rejects an empty refresh token before querying persistence', async () => {
    const service = createService();
    await expect(service.refreshToken('')).rejects.toBeInstanceOf(AuthError);
    expect(service.tokenRepo.findByToken).not.toHaveBeenCalled();
  });

  it('removes the supplied refresh token on logout', async () => {
    const service = createService();
    await service.logout('refresh-token');
    expect(service.tokenRepo.deleteToken).toHaveBeenCalledWith('refresh-token');
  });
});
