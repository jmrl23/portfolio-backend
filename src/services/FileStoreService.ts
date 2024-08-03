import { ReadStream } from 'node:fs';

type FileData = string | Buffer | ReadStream;

export interface Store {
  upload(file: FileData, fileName: string): Promise<string>;
}

export default class FileStoreService {
  constructor(private readonly store: Store) {}

  async upload(file: FileData, fileName: string): Promise<string> {
    const url = await this.store.upload(file, fileName);
    return url;
  }
}
