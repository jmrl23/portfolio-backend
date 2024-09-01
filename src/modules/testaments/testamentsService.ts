import { Prisma, PrismaClient } from '@prisma/client';
import { File } from 'fastify-multer/lib/interfaces';
import { BadRequest, Unauthorized, NotFound } from 'http-errors';
import { FromSchema } from 'json-schema-to-ts';
import { generate } from 'randomstring';
import { CacheService } from '../cache/cacheService';
import { FilesService } from '../files/filesService';
import {
  testamentCreateSchema,
  testamentListPayloadSchema,
  testamentSchema,
} from './testamentsSchema';
import ms from 'ms';

type Testament = FromSchema<typeof testamentSchema>;

type TestamentCreateBody = Omit<
  FromSchema<typeof testamentCreateSchema>,
  'image'
> & {
  readonly image?: File;
  readonly key: string;
};

type TestamentListByPayload = FromSchema<typeof testamentListPayloadSchema>;

export class TestamentsService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly filesService: FilesService,
    private readonly prismaClient: PrismaClient,
  ) {}

  public async createTestament(body: TestamentCreateBody): Promise<Testament> {
    const key = `TestamentKey[ref:generator]:${body.key}`;
    const isKeyAuthorized = await this.cacheService.get<string>(key);
    if (isKeyAuthorized === undefined) {
      throw Unauthorized('Invalid key');
    }

    let imageId: string | undefined;

    if (body.image) {
      if (!body.image.mimetype.startsWith('image')) {
        throw BadRequest('Invalid image');
      }

      const image = await this.filesService.uploadFile(body.image);
      imageId = image.id;
    }

    const testament = await this.prismaClient.testament.create({
      data: {
        author: body.author,
        bio: body.bio,
        content: body.content,
        imageId,
      },
      select: {
        id: true,
        createdAt: true,
        author: true,
        bio: true,
        content: true,
        image: {
          select: {
            id: true,
            createdAt: true,
            name: true,
            size: true,
            mimetype: true,
            url: true,
          },
        },
      },
    });

    await this.cacheService.del(key);
    return TestamentsService.serializeTestament(testament);
  }

  public async getTestamentsByPayload(
    payload: TestamentListByPayload,
  ): Promise<Testament[]> {
    const cacheKey = `Testaments:[ref:payload]:(${JSON.stringify([
      payload.createdAtFrom,
      payload.createdAtTo,
      payload.updatedAtFrom,
      payload.updatedAtTo,
      payload.skip,
      payload.take,
      payload.order,
      payload.id,
      payload.author,
      payload.bio,
      payload.content,
    ])})`;

    if (payload.revalidate === true) {
      await this.cacheService.del(cacheKey);
    }

    const cachedData = await this.cacheService.get<Testament[]>(cacheKey);
    if (cachedData !== undefined) return cachedData;

    const testaments = await this.prismaClient.testament.findMany({
      where: {
        createdAt: {
          gte: payload.createdAtFrom,
          lte: payload.createdAtTo,
        },
        id: payload.id,
        author: payload.author,
        bio: {
          startsWith: payload.bio,
        },
        content: {
          startsWith: payload.content,
        },
      },
      skip: payload.skip,
      take: payload.take,
      orderBy: {
        createdAt: payload.order,
      },
      select: {
        id: true,
        createdAt: true,
        author: true,
        bio: true,
        content: true,
        image: {
          select: {
            id: true,
            createdAt: true,
            name: true,
            size: true,
            mimetype: true,
            url: true,
          },
        },
      },
    });

    const testamentList: Testament[] = testaments.map((testament) =>
      TestamentsService.serializeTestament(testament),
    );
    await this.cacheService.set(cacheKey, testamentList, ms('5m'));
    return testamentList;
  }

  public async deleteTestamentById(id: string): Promise<Testament> {
    const existingTestament = await this.prismaClient.testament.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existingTestament) throw new NotFound('Testament not found');

    const testament = await this.prismaClient.testament.delete({
      where: { id },
      select: {
        id: true,
        createdAt: true,
        author: true,
        bio: true,
        content: true,
        image: {
          select: {
            id: true,
            createdAt: true,
            name: true,
            size: true,
            mimetype: true,
            url: true,
          },
        },
      },
    });
    return TestamentsService.serializeTestament(testament);
  }

  public async generateKey(): Promise<string> {
    const key = generate({
      length: 6,
    })
      .split('')
      .map((c) => {
        const isUppercase = !Math.round(Math.random());
        if (isUppercase) return c.toUpperCase();
        return c;
      })
      .join('');
    await this.cacheService.set(`TestamentKey[ref:generator]:${key}`, key);
    return key;
  }

  public static serializeTestament(
    testament: Prisma.TestamentGetPayload<{
      select: {
        id: true;
        createdAt: true;
        author: true;
        bio: true;
        content: true;
        image: {
          select: {
            id: true;
            createdAt: true;
            name: true;
            size: true;
            mimetype: true;
            url: true;
          };
        };
      };
    }>,
  ): Testament {
    return {
      ...testament,
      createdAt: testament.createdAt.toISOString(),
      image: testament.image
        ? FilesService.serializeFile(testament.image)
        : null,
    };
  }
}
