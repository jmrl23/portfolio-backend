import ImageKit from 'imagekit';
import { ReadStream } from 'node:fs';
import {
  IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_URL_ENDPOINT,
} from '../../lib/constant/env';
import { ImagekitStore } from './stores/imagekitStore';

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
      const requiredOptions = [
        IMAGEKIT_PUBLIC_KEY,
        IMAGEKIT_PRIVATE_KEY,
        IMAGEKIT_URL_ENDPOINT,
      ];

      if (requiredOptions.includes(undefined)) {
        throw new Error('Missing imagekit required option');
      }

      const imagekit = new ImageKit({
        publicKey: IMAGEKIT_PUBLIC_KEY!,
        privateKey: IMAGEKIT_PRIVATE_KEY!,
        urlEndpoint: IMAGEKIT_URL_ENDPOINT!,
      });

      return new ImagekitStore(imagekit);
  }
}
