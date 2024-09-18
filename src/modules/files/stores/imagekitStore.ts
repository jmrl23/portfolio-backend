import ImageKit from 'imagekit';
import { lookup } from 'mime-types';
import { IMAGEKIT_FOLDER } from '../../../lib/constant/env';
import { FileData, FileInfo, FilesStore } from '../filesStoreFactory';

export class ImagekitStore implements FilesStore {
  constructor(private readonly imagekit: ImageKit) {}

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
