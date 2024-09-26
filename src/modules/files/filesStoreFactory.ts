import { ImageKitStore } from './stores/imageKitStore';
import { FilesStoreInterface } from './stores/filesStoreInterface';

type Store = 'imagekit';

export async function filesStoreFactory(
  store: Store,
): Promise<FilesStoreInterface> {
  switch (store) {
    case 'imagekit':
      return new ImageKitStore();
  }
}
