import { caching } from 'cache-manager';
import assert from 'node:assert';
import { describe, it } from 'node:test';
import { CacheService } from './cacheService';

async function delay(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

describe('test cache service', async function () {
  const cache = await caching('memory');
  const cacheService = new CacheService(cache);

  it('set items', async () => {
    await Promise.all([
      assert.doesNotReject(cacheService.set('test:key:1', 'item 1')),
      assert.doesNotReject(cacheService.set('test:key:2', 'item 2', 200)),
    ]);
  });

  it('get items', async () => {
    const items = await cacheService.cache.store.keys('test:key:*');
    assert.strictEqual(items?.length, 2);
    await delay(200);
    const [item1, item2] = await Promise.all([
      cacheService.get<string>('test:key:1'),
      cacheService.get<string>('test:key:2'),
    ]);
    assert.strictEqual(item1, 'item 1');
    assert.strictEqual(item2, undefined);
  });

  it('delete item', async () => {
    await cacheService.del('test:key:1');
    const item = await cacheService.get<undefined>('test:key:1');
    assert.strictEqual(item, undefined);
  });
});
