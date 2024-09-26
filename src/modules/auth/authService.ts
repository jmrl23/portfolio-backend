import { Prisma, PrismaClient } from '@prisma/client';
import { Unauthorized, Forbidden } from 'http-errors';
import { FromSchema } from 'json-schema-to-ts';
import { generate } from 'randomstring';
import { CacheService } from '../cache/cacheService';
import { authApiKeyCreateSchema, authApiKeySchema } from './authSchema';
import authPermissions from './authPermissions.json';
import ms from 'ms';

export const permissions = ['auth.grantall', ...authPermissions];

const grantAll = permissions[0];

export type Permission = (typeof permissions)[number];

type AuthApiKey = FromSchema<typeof authApiKeySchema>;

export class AuthService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly prismaClient: PrismaClient,
  ) {}

  public async createAuthApiKey(
    payload: FromSchema<typeof authApiKeyCreateSchema>,
  ): Promise<AuthApiKey> {
    const key = AuthService.generateKey();
    const existingKey = await this.prismaClient.authApiKey.findUnique({
      where: { key },
    });
    if (existingKey) return await this.createAuthApiKey(payload);

    // grant all access should have expiration
    if (payload.permissions.includes(grantAll)) {
      if (payload.expires === undefined) {
        throw new Forbidden('Grant all access should have an expiration');
      }
    }

    const authApiKey = await this.prismaClient.authApiKey.create({
      data: {
        key,
        description: payload.description,
        permissions: payload.permissions,
        expires: payload.expires,
      },
      select: {
        id: true,
        createdAt: true,
        key: true,
        description: true,
        permissions: true,
        expires: true,
        revoked: true,
      },
    });

    return AuthService.serializeAuthApiKey(authApiKey);
  }

  public async getAuthApiKeyInfoByKey(key: string): Promise<AuthApiKey> {
    const cacheKey = `AuthService:AuthApiKey[ref:key]:${key}`;
    const cachedData = await this.cacheService.get<AuthApiKey | null>(cacheKey);
    if (cachedData !== undefined) {
      if (cachedData === null) throw new Unauthorized('Invalid api key');
      return cachedData;
    }

    const authApiKey = await this.prismaClient.authApiKey.findUnique({
      where: { key },
      select: {
        id: true,
        createdAt: true,
        key: true,
        description: true,
        permissions: true,
        expires: true,
        revoked: true,
      },
    });
    await this.cacheService.set(cacheKey, authApiKey, ms('5m'));

    if (!authApiKey) throw new Unauthorized('Invalid api key');

    return AuthService.serializeAuthApiKey(authApiKey);
  }

  public async verifyAuthApiKey(
    key: string,
    permissions: Permission[],
  ): Promise<void> {
    const info = await this.getAuthApiKeyInfoByKey(key);

    if (info.revoked) {
      throw new Unauthorized('API key revoked');
    }

    if (info.expires) {
      const expires = new Date(info.expires);
      const now = new Date();

      if (now >= expires) {
        throw new Unauthorized('API key expired');
      }
    }

    if (info.permissions.includes(grantAll)) return;

    for (const permission of permissions) {
      if (!info.permissions.includes(permission)) {
        throw new Unauthorized(`No permission for ${permission}`);
      }
    }
  }

  public async revokeAuthApiKeyById(id: string): Promise<AuthApiKey> {
    const authApiKey = await this.prismaClient.authApiKey.update({
      where: { id },
      data: { revoked: true },
      select: {
        id: true,
        createdAt: true,
        key: true,
        description: true,
        permissions: true,
        expires: true,
        revoked: true,
      },
    });
    await this.cacheService.del(`AuthApiKey[ref:key]:${authApiKey.key}`);
    return AuthService.serializeAuthApiKey(authApiKey);
  }

  private static generateKey(): string {
    const key = generate({
      length: 29,
    })
      .split('')
      .map((c) => {
        const isUppercase = !Math.round(Math.random());
        if (isUppercase) return c.toUpperCase();
        return c;
      })
      .join('');

    return `sk-${key}`;
  }

  private static serializeAuthApiKey(
    authApiKey: Prisma.AuthApiKeyGetPayload<{
      select: {
        id: true;
        createdAt: true;
        key: true;
        description: true;
        permissions: true;
        expires: true;
        revoked: true;
      };
    }>,
  ): AuthApiKey {
    return {
      ...authApiKey,
      createdAt: authApiKey.createdAt.toISOString(),
      permissions: authApiKey.permissions as Permission[],
      expires: authApiKey.expires?.toISOString(),
    };
  }
}
