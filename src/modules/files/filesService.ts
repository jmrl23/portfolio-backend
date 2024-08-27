import { PrismaClient } from '@prisma/client';
import { File } from 'fastify-multer/lib/interfaces';
import { InternalServerError } from 'http-errors';
import { FromSchema } from 'json-schema-to-ts';
import fs from 'node:fs';
import { CacheService } from '../cache/cacheService';
import { fileListPayloadSchema, fileSchema } from './filesSchema';
import { FilesStore } from './filesStoreFactory';

type FileInfo = FromSchema<typeof fileSchema>;

type FileListPayload = FromSchema<typeof fileListPayloadSchema>;

export class FilesService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly filesStore: FilesStore,
    private readonly prismaClient: PrismaClient,
  ) {}

  public async uploadFile(file: File): Promise<FileInfo> {
    if (!file.path) {
      throw InternalServerError('an error occurs while uploading a file');
    }

    const fileData = fs.readFileSync(file.path);
    const uploadedFile = await this.filesStore.upload(
      fileData,
      file.originalname,
    );
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
    const fileInfo: FileInfo & Record<string, unknown> = {
      ...deletedFile,
      createdAt: deletedFile.createdAt.toISOString(),
    };
    delete fileInfo.fileId;
    return fileInfo;
  }

  public async listFilesByPayload(
    payload: FileListPayload,
  ): Promise<FileInfo[]> {
    const cacheKey = `FileList:[payload]:(${JSON.stringify([
      payload.createdAtFrom,
      payload.createdAtTo,
      payload.id,
      payload.mimetype,
      payload.name,
      payload.sizeFrom,
      payload.sizeTo,
      payload.skip,
      payload.take,
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
    const fileList: FileInfo[] = files.map((file) => ({
      ...file,
      createdAt: file.createdAt.toISOString(),
    }));
    await this.cacheService.set(cacheKey, fileList);
    return fileList;
  }
}
