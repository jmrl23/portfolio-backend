import { ReadStream } from 'node:fs';
import { ImageKitStore } from './stores/imagekitStore';

export type FileData = string | Buffer | ReadStream;

export interface FileInfo {
  fileId: string;
  name: string;
  size: number;
  mimetype: string;
  url: string;
}

export interface FilesStore {
  upload(fileData: FileData, fileName: string): Promise<FileInfo>;
  delete(fileId: string): Promise<string>;
}

type Store = 'imagekit';

export async function filesStoreFactory(store: Store): Promise<FilesStore> {
  switch (store) {
    case 'imagekit':
      return new ImageKitStore();
  }
}
