import ImageKit from 'imagekit';
import { lookup } from 'mime-types';
import {
  IMAGEKIT_FOLDER,
  IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_URL_ENDPOINT,
} from '../../../lib/constant/env';
import { FileData, FileInfo, FilesStore } from '../filesStoreFactory';

export class ImageKitStore implements FilesStore {
  private imagekit: ImageKit;

  constructor() {
    const requiredOptions = [
      IMAGEKIT_PUBLIC_KEY,
      IMAGEKIT_PRIVATE_KEY,
      IMAGEKIT_URL_ENDPOINT,
    ];
    if (requiredOptions.includes(undefined))
      throw new Error('Missing required option');
    this.imagekit = new ImageKit({
      publicKey: IMAGEKIT_PUBLIC_KEY!,
      privateKey: IMAGEKIT_PRIVATE_KEY!,
      urlEndpoint: IMAGEKIT_URL_ENDPOINT!,
    });
  }

  async upload(fileData: FileData, fileName: string): Promise<FileInfo> {
    const response = await this.imagekit.upload({
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
  }

  async delete(fileId: string): Promise<string> {
    await this.imagekit.deleteFile(fileId);
    return fileId;
  }
}
