import { Prisma, PrismaClient } from '@prisma/client';
import { File } from 'fastify-multer/lib/interfaces';
import { BadRequest, Unauthorized, NotFound } from 'http-errors';
import { FromSchema } from 'json-schema-to-ts';
import { generate } from 'randomstring';
import { CacheService } from '../cache/cacheService';
import { FilesService } from '../files/filesService';
import {
  testimonialCreateSchema,
  testimonialListPayloadSchema,
  testimonialSchema,
} from './testimonialsSchema';
import ms from 'ms';

type Testimonial = FromSchema<typeof testimonialSchema>;

type TestimonialCreateBody = Omit<
  FromSchema<typeof testimonialCreateSchema>,
  'image'
> & {
  readonly image?: File;
  readonly key: string;
};

type TestimonialListByPayload = FromSchema<typeof testimonialListPayloadSchema>;

export class TestimonialsService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly filesService: FilesService,
    private readonly prismaClient: PrismaClient,
  ) {}

  public async createTestimonial(
    body: TestimonialCreateBody,
  ): Promise<Testimonial> {
    const key = `TestimonialKey[ref:generator]:${body.key}`;
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

    const testimonial = await this.prismaClient.testimonial.create({
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
    return TestimonialsService.serializeTestimonial(testimonial);
  }

  public async getTestimonialsByPayload(
    payload: TestimonialListByPayload,
  ): Promise<Testimonial[]> {
    const cacheKey = `Testimonials:[ref:payload]:(${JSON.stringify([
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

    const cachedData = await this.cacheService.get<Testimonial[]>(cacheKey);
    if (cachedData !== undefined) return cachedData;

    const testimonials = await this.prismaClient.testimonial.findMany({
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

    const testimonialList: Testimonial[] = testimonials.map((testimonial) =>
      TestimonialsService.serializeTestimonial(testimonial),
    );
    await this.cacheService.set(cacheKey, testimonialList, ms('5m'));
    return testimonialList;
  }

  public async deleteTestimonialById(id: string): Promise<Testimonial> {
    const existingTestimonial = await this.prismaClient.testimonial.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existingTestimonial) throw new NotFound('Testimonial not found');

    const testimonial = await this.prismaClient.testimonial.delete({
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
    return TestimonialsService.serializeTestimonial(testimonial);
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
    await this.cacheService.set(`TestimonialKey[ref:generator]:${key}`, key);
    return key;
  }

  public static serializeTestimonial(
    testimonial: Prisma.TestimonialGetPayload<{
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
  ): Testimonial {
    return {
      ...testimonial,
      createdAt: testimonial.createdAt.toISOString(),
      image: testimonial.image
        ? FilesService.serializeFile(testimonial.image)
        : null,
    };
  }
}
