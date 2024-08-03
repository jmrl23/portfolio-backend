import ImageKit from 'imagekit';
import {
  IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_URL_ENDPOINT,
} from './constant/env';
import { Store } from '../services/FileStoreService';

const imagekit = new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  privateKey: IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_URL_ENDPOINT,
});

export default imagekit;

export const store: Store = {
  async upload(file, fileName) {
    const response = await imagekit.upload({ file, fileName });
    return response.url;
  },
};
