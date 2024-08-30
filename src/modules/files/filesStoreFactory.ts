import ImageKit from 'imagekit';
import { lookup } from 'mime-types';
import { ReadStream } from 'node:fs';
import {
  IMAGEKIT_FOLDER,
  IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_URL_ENDPOINT,
} from '../../lib/constant/env';

export type FileData = string | Buffer | ReadStream;

interface FileInfo {
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
      const imagekit = new ImageKit({
        publicKey: IMAGEKIT_PUBLIC_KEY,
        privateKey: IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: IMAGEKIT_URL_ENDPOINT,
      });

      return {
        async upload(fileData, fileName) {
          const response = await imagekit.upload({
            file: fileData,
            fileName,
            folder: IMAGEKIT_FOLDER,
          });
          return {
            fileId: response.fileId,
            name: response.name,
            size: response.size,
            mimetype: lookup(response.name) || 'application/octet-stream',
            url: response.url,
          };
        },

        async delete(fileId) {
          await imagekit.deleteFile(fileId);
          return fileId;
        },
      };
  }
}
