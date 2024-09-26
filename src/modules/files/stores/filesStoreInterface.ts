export interface FileInfo {
  fileId: string;
  name: string;
  size: number;
  mimetype: string;
  url: string;
}

export interface FilesStoreInterface {
  upload(fileData: Buffer, fileName: string): Promise<FileInfo>;
  delete(fileId: string): Promise<string>;
}
