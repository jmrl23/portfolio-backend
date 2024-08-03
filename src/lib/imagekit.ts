import ImageKit from 'imagekit';
import {
  IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_URL_ENDPOINT,
} from './constant/env';
import { FileStore } from '../services/FileStorageService';

const imagekit = new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  privateKey: IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_URL_ENDPOINT,
});

export default imagekit;

export const fileStore: FileStore = {
  async upload(file, fileName) {
    const response = await imagekit.upload({
      file,
      fileName,
      folder: 'portfolio',
    });
    const { fileId, name, url, size } = response;
    return {
      id: fileId,
      fileName: name,
      url,
      size,
    };
  },

  async delete(id: string) {
    await imagekit.deleteFile(id);
    return id;
  },

  async get(payload) {
    const fileList = await imagekit.listFiles({
      includeFolder: false,
      name: payload.fileName,
      limit: payload.limit,
    });
    const files = fileList
      .map((file) => ({
        id: file.fileId,
        fileName: file.name,
        url: file.url,
        size: file.size,
      }))
      .filter(
        (file) =>
          file.size >= (payload.sizeMin ?? 0) &&
          file.size <= (payload.sizeMax ?? Number.MAX_SAFE_INTEGER),
      );

    return files;
  },
};
