import { Prisma, PrismaClient } from '@prisma/client';
import { Unauthorized } from 'http-errors';
import { FromSchema } from 'json-schema-to-ts';
import { generate } from 'randomstring';
import { CacheService } from '../cache/cacheService';
import { authApiKeyCreateSchema, authApiKeySchema } from './authSchema';

export const permissions = [
  'files.read',
  'files.write',
  'files.delete',
  'projects.read',
  'projects.write',
  'projects.delete',
  'emails.write',
] as const;

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
    const cacheKey = `AuthApiKey[ref:key]:${key}`;
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
    await this.cacheService.set(cacheKey, authApiKey);

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

      if (now <= expires) {
        throw new Unauthorized('API key expired');
      }
    }

    for (const permission of permissions) {
      if (!info.permissions.includes(permission)) {
        throw new Unauthorized(`No permission for ${permission}`);
      }
    }
  }

  private static generateKey(): string {
    const key = generate({
      length: 29,
      capitalization: 'lowercase',
      charset: 'hex',
    });

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
