import { SavedMultipartFile } from '@fastify/multipart';
import { Prisma, PrismaClient } from '@prisma/client';
import { InternalServerError } from 'http-errors';
import { FromSchema } from 'json-schema-to-ts';
import ms from 'ms';
import fs from 'node:fs';
import { CacheService } from '../cache/cacheService';
import { fileListPayloadSchema, fileSchema } from './filesSchema';
import { FilesStore } from './filesStoreFactory';

export type FileInfo = FromSchema<typeof fileSchema>;

export type FileListPayload = FromSchema<typeof fileListPayloadSchema>;

export class FilesService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly filesStore: FilesStore,
    private readonly prismaClient: PrismaClient,
  ) {}

  public async uploadFile(file: SavedMultipartFile): Promise<FileInfo> {
    if (!file.filepath) {
      throw InternalServerError('an error occurs while uploading a file');
    }

    const fileData = fs.readFileSync(file.filepath);
    const uploadedFile = await this.filesStore.upload(fileData, file.filename);
    const createdFile = await this.prismaClient.file.create({
      data: uploadedFile,
    });
    return {
      ...createdFile,
      createdAt: createdFile.createdAt.toISOString(),
    };
  }

  public async deleteFileById(id: string): Promise<FileInfo> {
    const deletedFile = await this.prismaClient.file.delete({
      where: { id },
      select: {
        id: true,
        createdAt: true,
        fileId: true,
        name: true,
        size: true,
        mimetype: true,
        url: true,
      },
    });
    await this.filesStore.delete(deletedFile.fileId);
    return FilesService.serializeFile(deletedFile);
  }

  public async getFilesByPayload(
    payload: FileListPayload,
  ): Promise<FileInfo[]> {
    const cacheKey = `FilesService:Files:[payload]:(${JSON.stringify([
      payload.createdAtFrom,
      payload.createdAtTo,
      payload.skip,
      payload.take,
      payload.order,
      payload.id,
      payload.mimetype,
      payload.name,
      payload.sizeFrom,
      payload.sizeTo,
    ])})`;

    if (payload.revalidate === true) {
      await this.cacheService.del(cacheKey);
    }

    const cachedData = await this.cacheService.get<FileInfo[]>(cacheKey);
    if (cachedData !== undefined) return cachedData;

    const files = await this.prismaClient.file.findMany({
      where: {
        createdAt: {
          gte: payload.createdAtFrom,
          lte: payload.createdAtTo,
        },
        id: payload.id,
        mimetype: payload.mimetype,
        name: {
          startsWith: payload.name,
        },
        size: {
          gte: payload.sizeFrom,
          lte: payload.sizeTo,
        },
      },
      select: {
        id: true,
        createdAt: true,
        name: true,
        size: true,
        mimetype: true,
        url: true,
      },
      skip: payload.skip,
      take: payload.take,
      orderBy: {
        createdAt: payload.order,
      },
    });
    const fileList: FileInfo[] = files.map((file) =>
      FilesService.serializeFile(file),
    );
    await this.cacheService.set(cacheKey, fileList, ms('5m'));
    return fileList;
  }

  public static serializeFile(
    file: Prisma.FileGetPayload<{
      select: {
        id: true;
        createdAt: true;
        name: true;
        size: true;
        mimetype: true;
        url: true;
      };
    }>,
  ): FileInfo {
    if ('fileId' in file) {
      delete file.fileId;
    }

    return {
      ...file,
      createdAt: file.createdAt.toISOString(),
    };
  }
}
