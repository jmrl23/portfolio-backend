import { ReadStream } from 'node:fs';
import CacheService from './CacheService';

type FileData = string | Buffer | ReadStream;

interface FileInfo {
  id: string;
  fileName: string;
  url: string;
  size: number;
}

interface GetPayload extends PayloadWithRevalidate {
  fileName?: string;
  sizeMin?: number;
  sizeMax?: number;
  limit?: number;
}

export interface FileStore {
  upload(file: FileData, fileName: string): Promise<FileInfo>;
  delete(id: string): Promise<string>;
  get(payload: GetPayload): Promise<FileInfo[]>;
}

export default class FileStoreService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly store: FileStore,
  ) {}

  public upload = this.store.upload.bind(this.store);

  public delete = this.store.delete.bind(this.store);

  public async get(payload: GetPayload): Promise<FileInfo[]> {
    const cacheKey = `get:[${JSON.stringify([payload.fileName, payload.limit, payload.sizeMin, payload.sizeMax])}]`;

    if (payload.revalidate === true) {
      await this.cacheService.del(cacheKey);
    }

    const cachedList = await this.cacheService.get<FileInfo[]>(cacheKey);
    if (cachedList) return cachedList;

    const files = await this.store.get(payload);
    await this.cacheService.set(cacheKey, files);
    return files;
  }
}
